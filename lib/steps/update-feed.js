'use strict';

const request = require('request'),
      chalk = require('chalk');

module.exports = (state, _, cb) => {
  if (state.posts.length === 0) {
    cb();
  } else {
    const url = state.conf('api:url');

    state.log.info(`saving feed ${chalk.green(state.feed.uri)}`);

    request({
      url: `${url}/feeds/${state.feed.id}`,
      method: 'PUT',
      body: state.feed,
      json: true
    }, cb);
  }
};
