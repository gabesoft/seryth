'use strict';

const request = require('../request'),
      eyes = require('eyes'),
      chalk = require('chalk');

module.exports = (state, options, cb) => {
  if (!state.feed.id) {
    state.subscriptions = [];
    return cb();
  }

  const url = state.conf('api:url'),
        feed = state.feed,
        opts = {
          url: `${url}/search/feed-subscriptions`,
          method: 'POST',
          body: { query: { feedId: feed.id } },
          json: true
        };

  request(opts, (err, res, subscriptions) => {
    if (err) {
      state.subscriptions = [];
      state.log.error(err.message);
    } else if (Array.isArray(subscriptions)) {
      const cnt = chalk.blue(subscriptions.length),
            id = chalk.yellow(feed.id);
      state.subscriptions = subscriptions;
      state.log.info(`found ${cnt} subscriptions for feed ${id}`);
    } else {
      eyes.inspect(subscriptions);
    }
    cb(err);
  });
};
