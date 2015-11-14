'use strict';

const request = require('request'),
      chalk = require('chalk');

module.exports = (state, options, cb) => {
  state.feed = { uri: options.uri };

  const url = state.conf('api:url'),
        opts = {
          url: `${url}/feeds`,
          qs: { uri: options.uri },
          method: 'GET',
          json: true
        };

  request(opts, (err, _, feed) => {
    if (err) {
      state.log.error(err.message);
    } else if (feed.length === 1) {
      state.feed = feed[0];
      state.log.warn(`feed ${chalk.yellow(state.feed.uri)} already exists`);
    } else {
      state.log.info(`feed ${chalk.green(state.feed.uri)} is new`);
    }
    cb();
  });
};
