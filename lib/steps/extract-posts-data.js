const async = require('async'),
      chalk = require('chalk');

module.exports = (state, opts, cb) => {
  async.each(Object.keys(state.posts), (feed, next) => {
    const keys = state.posts[feed].map(post => `posts:${post.id}`);

    state.db.mget(keys, (err, data) => {
      if (err) { return next(err); }

      state.posts[feed] = state.posts[feed].map((obj, index) => {
        const post = JSON.parse(data[index] || '{}');
        post.id = obj.id;
        return post;
      });

      state.log.info(`${chalk.green(feed)} (${chalk.blue(data.length)} posts data extracted)`);
      return next();
    });
  }, cb);
};
