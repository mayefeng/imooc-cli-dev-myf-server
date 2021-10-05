'use strict';

const REDIS_PREFIX = 'cloudbuild';

module.exports = () => {
  return async (ctx, next) => {
    console.log('connect');
    const { app, socket, logger, helper } = ctx;
    const { id } = socket;
    const { redis } = app;
    const query = socket.handshake.query;
    try {
      socket.emit(id, helper.parseMsg('connect', {
        type: 'connect',
        message: '云构建服务连接成功',
      }));
      let hasTask = await redis.get(`${REDIS_PREFIX}:${id}`);
      if (!hasTask) {
        await redis.set(`${REDIS_PREFIX}:${id}`, JSON.stringify(query));
      }
      hasTask = await redis.get(`${REDIS_PREFIX}:${id}`);
      logger.info('query', hasTask);
      await next();
      console.log('disconnect!');
    } catch (e) {
      logger.error('build error', e);
    }
  };
};
