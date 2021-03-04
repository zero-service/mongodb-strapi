'use strict';

const {sanitizeEntity} = require('strapi-utils');
const qiniu = require('qiniu');

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  // find: async ctx => {
  //   strapi.log.info('174');
  //   ctx.log.info('174x');
  //
  //   strapi.log.fatal('78987');
  //   ctx.log.fatal('78987x');
  //   ctx.send('Hello World!');
  // },
  // async find() {
  //   return 'strapi';
  // },

  async find(ctx) {
    let entities;
    ctx.log.fatal(JSON.stringify(ctx.query));
    ctx.log.fatal(JSON.stringify(ctx.query._q));
    ctx.log.fatal(ctx.query._q);
    if (ctx.query._q) {
      entities = await strapi.services.restaurant.search(ctx.query);
    } else {
      entities = await strapi.services.restaurant.find(ctx.query);
    }


    return entities.map(entity => {
      const restaurant = sanitizeEntity(entity, {
        model: strapi.models.restaurant,
      });
      if (restaurant.createdAt) {
        delete restaurant.createdAt;
      }
      if (restaurant.categories) {
        restaurant.categories.map(item => {
          delete item.name;
        })
      }
      return restaurant;
    });
  },
  async count(ctx) {
    var accessKey = 'jDDs0yej7KG_HTqAoTbkI-U9v4b_GjKORYwZV_mt';
    var secretKey = 'Qc2zFVu4tk3RNRbTEC8Jm8iGyBCXthRvqn-7zoB_';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    var options = {
      scope: 'recolor-article',
      expires: 7200,
      callbackUrl: 'http://api.example.com/qiniu/upload/callback',
      returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
      callbackBodyType: 'application/json',
      callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)","age":$(x:age)}',
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);

    return uploadToken;
  },
  async upload(ctx) {
    var accessKey = 'jDDs0yej7KG_HTqAoTbkI-U9v4b_GjKORYwZV_mt';
    var secretKey = 'Qc2zFVu4tk3RNRbTEC8Jm8iGyBCXthRvqn-7zoB_';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    var options = {
      scope: 'recolor-article',
      expires: 7200,
      // callbackUrl: 'http://api.example.com/qiniu/upload/callback',
      returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
      callbackBodyType: 'application/json',
      callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)","age":$(x:age)}',
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);

    var localFile = "/Users/tenvine/Downloads/load_failed.png";
    var config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_na0;
    console.log(config);

    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    var key = 'dev2/rn/ios/RN_IOS_SOURCE.png';
// 文件上传

    console.log(uploadToken);
    let result = '200';
    formUploader.putFile(uploadToken, key, localFile, putExtra,
      function (respErr,
                respBody, respInfo) {
        if (respErr) {
          console.log(respErr);
          result = '201';
        }
        if (respInfo.statusCode == 200) {
          console.log(respBody);
          result = '200';
        } else {
          console.log(respInfo.statusCode);
          console.log(respBody);
          result = respInfo.statusCode;
        }
      });
    return result;
  }
};
