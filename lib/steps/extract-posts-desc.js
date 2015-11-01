const async = require('async'),
      chalk = require('chalk');

module.exports = (state, opts, cb) => {
  async.each(Object.keys(state.posts), (feed, next) => {
    const keys = state.posts[feed].map(post => `post:${post.id}:desc`);

    state.db.mget(keys, (err, data) => {
      if (err) { return next(err); }

      state.posts[feed].forEach((post, index) => {
        post.description = data[index];
      });

      state.log.info(`${chalk.green(feed)} (${chalk.blue(data.length)} posts description extracted)`);
      return next();
    });
  }, cb);
};
