'use strict';

const Runner = require('srunner').Runner,
      path = require('path'),
      root = process.cwd(),
      store = require('../config/store'),
      runner = new Runner({ name: path.parse(module.filename).name });

module.exports = (opts, cb) => {
  cb = cb || (() => {});

  const init = {
    dir: path.join(__dirname, 'steps'),
    state: { root, conf: store.get.bind(store) }
  };

  runner
    .init(init)
    .readFeed({ uri: opts.feedUri })
    .readExistingPosts()
    .fetchFeedData()
    .processFeedData()
    .updateFeed()
    .updatePosts()
    .readSubscriptions()
    .indexPosts({ read: true })
    .run((err, state) => cb(err, state.feed));
};
