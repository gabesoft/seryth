'use strict';

const Runner = require('srunner').Runner,
      redis = require('redis'),
      path = require('path'),
      runner = new Runner({ name: path.parse(module.filename).name }),
      store = require('../config/store'),
      db = redis.createClient(store.get('redis:port'), store.get('redis:host'), {}),
      root = process.cwd();

module.exports = (opts, callback) => {
  const cb = callback || (() => {});
  const init = {
    dir: path.join(__dirname, 'steps'),
    state: {
      root: root,
      conf: store.get.bind(store),
      db: db
    }
  };

  runner
    .init(init)
    .extractFeeds()
    .extractFeedsData()
    .extractPosts()
    .extractPostsData()
    .extractPostsDesc()
    .saveResults()
    .run(err => {
      db.quit();
      cb(err);
    });
};
