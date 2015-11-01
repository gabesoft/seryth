const Runner = require('srunner').Runner,
      runner = new Runner({ name: 'extract' }),
      redis = require('redis'),
      path = require('path'),
      root = process.cwd(),
      db = redis.createClient(6380, 'localhost', {});

module.exports = (opts, callback) => {
  const cb = callback || (() => {});

  const init = {
    dir: path.join(__dirname, 'steps'),
    state: {
      root: root,
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
