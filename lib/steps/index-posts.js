'use strict';

const async = require('async'),
      chalk = require('chalk'),
      request = require('../request');

module.exports = (state, options, cb) => {
  options = options || {};

  if (state.subscriptions.length === 0) {
    state.log.warn('no subscriptions found');
    return cb();
  }

  const existing = state.postGuids || {},
        posts = state.posts.filter(post => !existing[post.guid]),
        postIds = posts.map(post => post.id),
        subscriptions = state.subscriptions,
        url = state.conf('api:url'),
        opts = {
          method: 'POST',
          body: { postIds, data: { read: Boolean(options.read) } },
          json: true
        };

  async.each(subscriptions, (sub, next) => {
    opts.url = `${url}/bulk/user-posts/${sub.id}`;

    request(opts, err => {
      const id = chalk.yellow(sub.id),
            cnt = chalk.blue(postIds.length);

      if (err) {
        state.log.error(`failed to index posts for subscription ${id}`);
      } else {
        state.log.info(`indexed ${cnt} posts for subscription ${id}`);
      }
      next();
    });
  }, cb);
};
