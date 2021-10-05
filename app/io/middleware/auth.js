'use strict';

module.exports = () => {
  return async (ctx, next) => {
    console.log('connect');
    const { socket, logger } = ctx;
    const query = socket.handshake.query;
    logger.info('query', query);
    await next();
    console.log('disconnect!');
  };
};
