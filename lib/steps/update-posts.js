'use strict';

const chalk = require('chalk'),
      eyes = require('eyes'),
      request = require('../request');

module.exports = (state, _, cb) => {
  const url = state.conf('api:url');

  if (state.posts.length === 0) {
    state.log.warn('no new posts found to save');
    return cb();
  } else if (!state.feed.id) {
    state.log.error(`feed ${chalk.red(state.feed.uri)} has no database id`);
    return cb();
  }

  state.log.info(`saving ${chalk.blue(state.posts.length)} posts`);

  state.posts.forEach(post => post.feedId = state.feed.id);

  const opts = {
    url: `${url}/bulk/posts`,
    method: 'POST',
    body: state.posts,
    json: true
  };

  request(opts, (err, _, body) => {
    if (err) {
      state.log.error('failed saving posts');
      eyes.inspect(err);
    } else if (!Array.isArray(body)) {
      state.log.error('failed saving posts');
      eyes.inspect(body);
    } else {
      body.forEach((data, index) => {
        const post = state.posts[index];
        if (data.isError) {
          state.log.error(`failed saving post ${chalk.red(post.guid)}`);
          eyes.inspect(data);
        } else {
          state.log.info(`saved post ${chalk.blue(data.id)} ${chalk.green(data.guid)}`);
          post.id = data.id;
        }
      });
    }
    cb(err);
  });
};
