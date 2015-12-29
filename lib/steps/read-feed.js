'use strict';

const request = require('request'),
      chalk = require('chalk');

module.exports = (state, options, cb) => {
  state.feed = { uri: options.uri };

  const url = state.conf('api:url'),
        opts = {
          url: `${url}/search/feeds`,
          body: { query: { uri: options.uri } },
          method: 'POST',
          json: true
        };

  request(opts, (err, _, feeds) => {
    if (err) {
      state.log.error(err.message);
    } else if (feeds.length === 1) {
      state.feed = feeds[0];
      state.log.warn(`feed ${chalk.yellow(state.feed.uri)} already exists`);
    } else {
      state.log.info(`feed ${chalk.green(state.feed.uri)} is new`);
    }
    cb();
  });
};
