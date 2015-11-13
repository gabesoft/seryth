'use strict';

const Runner = require('srunner').Runner,
      path = require('path'),
      defaultsDeep = require('lodash').defaultsDeep,
      assign = require('lodash').assign,
      root = process.cwd(),
      store = require('../config/store'),
      runner = new Runner({ name: 'extract' });

module.exports = (opts, callback) => {
  const cb = callback || (() => {});
  const init = {
    dir: path.join(__dirname, 'steps'),
    state: {
      root: root,
      conf: store.get.bind(store)
    }
  };

  function mkFeedRunner(state) {
    return new Runner({ name: state.feed.uri })
      .init(defaultsDeep({ state }, init))
      .fetchExistingPosts()
      .fetchNewPosts()
      .processPosts()
      .savePosts()
      .updateFeed();
  }

  runner
    .init(assign({}, init))
    .readFeeds()
    .forEachFeedDo(mkFeedRunner)
    .run(err => {
      cb(err);
    });
};
