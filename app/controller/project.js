'use strict';

const Controller = require('egg').Controller;
const mongo = require('../utils/mongo');

class ProjectController extends Controller {
  // 获取项目/组件的代码模板
  async getTemplate() {
    const { ctx } = this;
    const data = await mongo().query('project');
    ctx.body = data;
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
