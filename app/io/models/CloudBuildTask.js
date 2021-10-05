'use strict';
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const userHome = require('user-home');
const Git = require('simple-git');

const { SUCCESS, FAILED } = require('../../const');

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
    this._logger.info('_dir', this._dir);
    this._logger.info('_sourceCodeDir', this._sourceCodeDir);
  }

  async prepare() {
    fse.ensureDirSync(this._dir);
    fse.emptyDirSync(this._dir);
    this._git = new Git(this._dir);
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
    let res = true;
    res && (res = await this.execCommand('npm install --registry=https://registry.npm.taobao.org'));
    return res ? this.success() : this.failed();
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


function exec(command, args, options) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? [ '/c' ].concat(command, args) : args;
  // cp.spawn('cmd', ['/c', 'node', '-e', code])
  return require('child_process').spawn(cmd, cmdArgs, options || {});

}

module.exports = CloudBuildTask;
