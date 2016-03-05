'use strict';

const request = require('../request'),
      trans = require('trans'),
      chalk = require('chalk');

module.exports = (state, opts, cb) => {
  const url = state.conf('api:url'),
        existing = state.feed.id,
        newCount = state.posts.length,
        postCount = Object.keys(state.postGuids).length + newCount;

  let dates = trans(state.postGuids).array().pluck('value.date').value();
  dates = dates.concat(trans(state.posts).pluck('date').value());
  dates = dates.map(date => new Date(date));

  state.feed.postCount = postCount;
  state.feed.lastPostDate = new Date(Math.max(...dates));

  const uriStr = chalk.green(state.feed.uri);
  const postCountStr = chalk.blue(postCount);
  const newCountStr = chalk.magenta(newCount);

  state.log.info(`saving feed ${uriStr} (${newCountStr}/${postCountStr})`);

  request({
    url: existing ? `${url}/feeds/${state.feed.id}` : `${url}/feeds`,
    method: existing ? 'PATCH' : 'POST',
    body: state.feed,
    json: true
  }, (err, _, body) => {
    if (err) {
      state.log.error(`failed to update feed ${state.feed.uri}`);
    } else {
      state.feed = body;
      state.feed.isNew = !existing;
    }
    cb(err);
  });
};
