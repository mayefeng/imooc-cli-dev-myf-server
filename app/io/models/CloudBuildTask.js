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

module.exports = CloudBuildTask;
