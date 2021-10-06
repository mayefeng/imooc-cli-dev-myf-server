'use strict';

const fs = require('fs');
const path = require('path');
const userHome = require('user-home');

/** MONGODB **/
const mongodbUrl = 'mongodb://mayefeng:123456@localhost:27017/admin';
const mongodbDbName = 'imooc-cli';

/** OSS **/
const OSS_ACCESS_KEY = 'LTAI5tLNKC8ZDh23maYmjTHn';
const OSS_ACCESS_SECRET_KEY = fs.readFileSync(path.resolve(userHome, '.imooc-cli-dev-myf', 'oss_access_secret_key')).toString();
const OSS_PROD_BUCKET = 'myf-cli';
const OSS_DEV_BUCKET = 'myf-cli-dev-bucket';
const OSS_REGION = 'oss-cn-hangzhou';

module.exports = {
  mongodbUrl,
  mongodbDbName,
  OSS_ACCESS_KEY,
  OSS_ACCESS_SECRET_KEY,
  OSS_PROD_BUCKET,
  OSS_DEV_BUCKET,
  OSS_REGION,
};
