'use strict';
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const userHome = require('user-home');
const Git = require('simple-git');

const { SUCCESS, FAILED } = require('../../const');
const config = require('../../../config/db');
const OSS = require('../models/OSS');

class CloudBuildTask {
  constructor(options, ctx) {
    this._ctx = ctx;
    this._logger = this._ctx.logger;
    // 仓库地址
    this._repo = options.repo;
    // 项目名称
    this._name = options.name;
    // 项目版本号
    this._version = options.version;
    // 仓库分支号
    this._branch = options.branch;
    // 构建命令
    this._buildCmd = options.buildCmd;
    // 缓存目录
    this._dir = path.resolve(userHome, '.imooc-cli-dev-myf', 'cloudbuild', `${this._name}@${this._version}`);
    // 缓存源码目录
    this._sourceCodeDir = path.resolve(this._dir, this._name);
    // 发布是否为正式环境
    this._prod = options.prod === 'true';
    this._logger.info('_dir', this._dir);
    this._logger.info('_sourceCodeDir', this._sourceCodeDir);
    this._logger.info('_prod', this._prod);
  }

  async prepare() {
    fse.ensureDirSync(this._dir);
    fse.emptyDirSync(this._dir);
    this._git = new Git(this._dir);
    if (this._prod) {
      this.oss = new OSS(config.OSS_PROD_BUCKET);
    } else {
      this.oss = new OSS(config.OSS_DEV_BUCKET);
    }
    console.log('oss=======', this.oss);
    return this.success();
  }

  async download() {
    await this._git.clone(this._repo);
    this._git = new Git(this._sourceCodeDir);
    // git checkout -b dev/1.1.1 origin/dev/1.1.1
    await this._git.checkout([
      '-b',
      this._branch,
      `origin/${this._branch}`,
    ]);
    return fs.existsSync(this._sourceCodeDir) ? this.success() : this.failed();
  }

  async install() {
    const res = await this.execCommand('npm install --registry=https://registry.npm.taobao.org');
    return res ? this.success() : this.failed();
  }

  async build() {
    let res;
    if (checkCommand(this._buildCmd)) {
      res = await this.execCommand(this._buildCmd);
    } else {
      res = false;
    }
    return res ? this.success() : this.failed();
  }

  prePublish() {
    // 获取构建结果
    const buildPath = this.findBuildPath();
    // 检查构建结果
    if (!buildPath) {
      return this.failed('未找到构建结果，请检查');
    }
    this._buildPath = buildPath;
    return this.success();
  }

  findBuildPath() {
    const buildDir = [ 'dist', 'build' ];
    const buildPath = buildDir.find(dir => fs.existsSync(path.resolve(this._sourceCodeDir, dir)));
    this._ctx.logger.info('buildPath', buildPath);
    if (buildPath) {
      return path.resolve(this._sourceCodeDir, buildPath);
    }
    return null;
  }

  publish() {

  }

  execCommand(command) {
    const commands = command.split(' ');
    if (commands.length === 0) {
      return null;
    }
    const firstCommand = commands[0];
    const leftCommand = commands.slice(1) || [];
    return new Promise(resolve => {
      const p = exec(firstCommand, leftCommand, {
        cwd: this._sourceCodeDir,
      }, { stdio: 'pipe' });
      p.on('error', e => {
        this._ctx.logger.error('build error', e);
        resolve(false);
      });
      p.on('exit', c => {
        this._ctx.logger.info('build exit', c);
        resolve(true);
      });
      p.stdout.on('data', data => {
        this._ctx.socket.emit('building', data.toString());
      });
      p.stderr.on('data', data => {
        this._ctx.socket.emit('building', data.toString());
      });
    });
  }

  success(message, data) {
    return this.response(SUCCESS, message, data);
  }

  failed(message, data) {
    return this.response(FAILED, message, data);
  }

  response(code, message, data) {
    return {
      code,
      message,
      data,
    };
  }
}

function checkCommand(command) {
  if (command) {
    const commands = command.split(' ');
    if (commands.length === 0 || ![ 'npm', 'cnpm' ].includes(commands[0])) {
      return false;
    }
    return true;
  }
  return false;
}

function exec(command, args, options) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? [ '/c' ].concat(command, args) : args;
  // cp.spawn('cmd', ['/c', 'node', '-e', code])
  return require('child_process').spawn(cmd, cmdArgs, options || {});

}

module.exports = CloudBuildTask;
