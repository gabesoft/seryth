'use strict';

const Runner = require('srunner').Runner,
      path = require('path'),
      defaultsDeep = require('lodash').defaultsDeep,
      assign = require('lodash').assign,
      root = process.cwd(),
      chalk = require('chalk'),
      store = require('../config/store'),
      runner = new Runner({ name: path.parse(module.filename).name });

module.exports = (_, cb) => {
  cb = cb || (() => {});

  const init = {
    dir: path.join(__dirname, 'steps'),
    state: { root, conf: store.get.bind(store) }
  };

  function mkFeedRunner(state, index, total) {
    const totalStr = chalk.blue(total);
    const indexStr = chalk.yellow(index + 1);
    const feedUri = chalk.green(state.feed.uri);

    return new Runner({ name: `${indexStr}/${totalStr} ${feedUri}` })
      .init(defaultsDeep({ state }, init))
      .readExistingPosts()
      .fetchFeedData()
      .processFeed()
      .processFeedPosts()
      .updateFeed()
      .updatePosts()
      .readSubscriptions()
      .indexPosts();
  }

  runner
    .init(assign({}, init))
    .readFeeds()
    .forEachFeedDo(mkFeedRunner)
    .run(cb);
};
