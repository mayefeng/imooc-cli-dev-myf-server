'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/project/template', controller.project.getTemplate);
  router.get('/project/oss', controller.project.getOSSProject);
  router.get('/oss/get', controller.project.getOSSFile);
  router.get('/redis/test', controller.project.getRedis);

  // app.io.of('/')
  app.io.route('build', app.io.controller.build.index);
};
