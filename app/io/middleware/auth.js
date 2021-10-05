'use strict';

module.exports = () => {
  return async (ctx, next) => {
    console.log('connect');
    const { socket, logger, helper } = ctx;
    const { id } = socket;
    const query = socket.handshake.query;
    try {
      logger.info('query', query);
      socket.emit(id, helper.parseMsg('connect', {
        type: 'connect',
        message: '云构建服务连接成功',
      }));
      await next();
      console.log('disconnect!');
    } catch (e) {
      logger.error('build error', e);
    }
  };
};
