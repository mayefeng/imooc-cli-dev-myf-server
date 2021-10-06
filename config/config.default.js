/* eslint valid-jsdoc: "off" */

'use strict';

// local
const REDIS_PORT = 6379;
const REDIS_HOST = '127.0.0.1';
const REDIS_PWD = '';

// aliyun
// const REDIS_PORT = 6379;
// const REDIS_HOST = 'r-bp1a826nogx55pke5jpd.redis.rds.aliyuncs.com';
// const REDIS_PWD = 'myf:Myf123456';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1630723668254_4647';

  // add your middleware config here
  config.middleware = [];

  // add WebSocket Server
  config.io = {
    namespace: {
      '/': {
        // 连接过程中的中间件
        connectionMiddleware: [ 'auth' ],
        // 发起请求到服务的拦截，在controller中自定义处理事件之前
        packetMiddleware: [ 'filter' ],
      },
    },
  };

  config.redis = {
    client: {
      port: REDIS_PORT, // Redis port
      host: REDIS_HOST, // Redis host
      password: REDIS_PWD,
      db: 0,
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
