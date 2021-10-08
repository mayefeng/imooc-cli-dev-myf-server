'use strict';

const Controller = require('egg').Controller;
const mongo = require('../utils/mongo');
const OSS = require('../io/models/OSS');
const config = require('../../config/db');
const { failed, success } = require('../utils/request');

class ProjectController extends Controller {
  // 获取项目/组件的代码模板
  async getTemplate() {
    const { ctx } = this;
    const data = await mongo().query('project');
    ctx.body = data;
  }

  async getOSSProject() {
    const { ctx } = this;
    let ossProjectType = ctx.query.type;
    const ossProjectName = ctx.query.name;
    if (!ossProjectName) {
      ctx.body = failed('项目名称不存在');
      return;
    }
    if (!ossProjectType) {
      ossProjectType = 'prod';
    }
    let oss;
    if (ossProjectType === 'prod') {
      oss = new OSS(config.OSS_PROD_BUCKET);
    } else {
      oss = new OSS(config.OSS_DEV_BUCKET);
    }
    if (oss) {
      const fileList = await oss.list(ossProjectName);
      ctx.body = success('获取项目文件成功', fileList);
    } else {
      ctx.body = failed('获取项目文件失败');
    }
  }

  async getOSSFile() {
    const { ctx } = this;
    const dir = ctx.query.name;
    const file = ctx.query.file;
    let ossProjectType = ctx.query.type;
    if (!dir || !file) {
      ctx.body = failed('请提供OSS文件名称');
      return;
    }
    if (!ossProjectType) {
      ossProjectType = 'prod';
    }
    let oss;
    if (ossProjectType === 'prod') {
      oss = new OSS(config.OSS_PROD_BUCKET);
    } else {
      oss = new OSS(config.OSS_DEV_BUCKET);
    }
    if (oss) {
      const fileList = await oss.list(dir);
      const fileName = `${dir}/${file}`;
      const finalFile = fileList.find(item => item.name === fileName);
      ctx.body = success('获取项目文件成功', finalFile);
    } else {
      ctx.body = failed('获取项目文件失败');
    }
  }

  async getRedis() {
    const { ctx, app } = this;
    const { key } = ctx.query;
    if (key) {
      const test = await app.redis.get(key);
      ctx.body = `redis[${key}]:${test}`;
    } else {
      ctx.body = '请提供参数key';
    }
  }
}

module.exports = ProjectController;
