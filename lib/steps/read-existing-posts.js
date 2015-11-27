'use strict';

const request = require('request'),
      trans = require('trans'),
      chalk = require('chalk');

function makeGuidMap(posts) {
  return trans(posts).object('guid').value();
}

module.exports = (state, options, cb) => {
  if (!state.feed.id) {
    state.postGuids = {};
    return cb();
  }

  const url = state.conf('api:url'),
        feed = state.feed,
        opts = {
          url: `${url}/posts`,
          method: 'GET',
          qs: { fields: 'guid~date', feedId: feed.id },
          json: true
        };

  request(opts, (err, res, posts) => {
    if (err) {
      state.postGuids = [];
      state.log.error(err.message);
    } else {
      state.postGuids = makeGuidMap(posts);
      state.log.info(`feed ${chalk.yellow(feed.uri)} has ${chalk.blue(posts.length)} posts`);
    }
    cb(err);
  });
};
