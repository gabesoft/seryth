'use strict';

const async = require('async'),
      chalk = require('chalk'),
      eyes = require('eyes'),
      request = require('request');

module.exports = (state, _, cb) => {
  const url = state.conf('api:url');

  if (state.posts.length === 0) {
    return cb();
  }

  state.log.info(`saving ${chalk.blue(state.posts.length)} posts`);
  async.each(state.posts, (post, next) => {
    const opts = {
      url: `${url}/posts`,
      method: 'POST',
      body: post,
      json: true,
      timeout: 60000,
      pool: false
    };

    request(opts, (err, _, body) => {
      if (err) {
        state.log.error(`failed saving post ${chalk.red(post.link)}`);
        state.log.error(err.message);
      } else if (body && !body.id && body.statusCode === 409) {
        state.log.warn(`post ${chalk.yellow(post.link)} already exists`);
      } else if (body && !body.id) {
        eyes.inspect(body);
      } else if (body) {
        state.log.info(`saved post ${chalk.blue(body.id)} : ${chalk.green(body.link)}`);
      }

      next();
    });
  }, cb);
};

