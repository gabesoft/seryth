'use strict';

const request = require('../request');
const chalk = require('chalk');

module.exports = (state, options, cb) => {
  const url = state.conf('api:url');
  const opts = {
    url: `${url}/search/feeds`,
    method: 'GET',
    json: true
  };

  request(opts, (err, res, feeds) => {
    if (err) {
      state.log.error(err.message);
    } else {
      state.feeds = feeds;
      state.log.info(`found ${chalk.blue(feeds.length)} feeds`);
    }
    cb(err);
  });
};
