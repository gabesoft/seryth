'use strict';

const request = require('request'),
      trans = require('trans'),
      chalk = require('chalk');

module.exports = (state, opts, cb) => {
  const url = state.conf('api:url'),
        existing = state.feed.id,
        newCount = state.posts.length,
        postCount = Object.keys(state.postGuids).length + newCount;

  let dates = trans(state.postGuids).array().pluck('value.date').value();
  dates = dates.concat(trans(state.posts).pluck('date').value());
  dates = trans(dates).sort(':desc').value();

  state.feed.postCount = postCount;
  state.feed.lastPostDate = dates[0];

  state.log.info(`saving feed ${chalk.green(state.feed.uri)} (${chalk.magenta(newCount)}/${chalk.blue(postCount)})`);

  request({
    url: existing ? `${url}/feeds/${state.feed.id}` : `${url}/feeds`,
    method: existing ? 'PATCH' : 'POST',
    body: state.feed,
    json: true
  }, (err, _, body) => {
    if (err) {
      state.log.error(`failed to update feed ${state.feed.uri}`);
      cb(err);
    } else {
      state.feed = body;
      state.feed.isNew = !existing;
      cb();
    }
  });
};
