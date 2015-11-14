'use strict';

const request = require('request'),
      chalk = require('chalk');

module.exports = (state, opts, cb) => {
  const url = state.conf('api:url'),
        existing = state.feed.id;

  state.log.info(`saving feed ${chalk.green(state.feed.uri)}`);

  request({
    url: existing ? `${url}/feeds/${state.feed.id}` : `${url}/feeds`,
    method: existing ? 'PUT' : 'POST',
    body: state.feed,
    json: true
  }, (err, _, body) => {
    if (err) {
      state.log.error(`failed to update feed ${state.feed.uri}`);
      cb(err);
    } else {
      state.feed = body;
      cb();
    }
  });
};
