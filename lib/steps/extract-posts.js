const async = require('async'),
      chalk = require('chalk'),
      blacklisted = [
        'http://veewhois.com/feed.xml',
        'http://blog.alicialiu.net/rss',
        'http://www.drperlmutter.com/feed/',
        'https://www.reddit.com/r/vim/.rss',
        'http://www.reddit.com/r/angularjs/comments/26l8uu/digging_into_angulars_controller_as_syntax/.rss'
      ];

module.exports = (state, opts, cb) => {
  state.posts = {};

  async.each(state.feeds, (feed, next) => {
    if (blacklisted.indexOf(feed.id) !== -1) {
      return next();
    }

    return state.db.zrevrange(`posts_by_feed:${feed.id}`, 0, -1, (err, data) => {
      state.posts[feed.id] = data.map(id => { return { id }; });

      if (data.length === 0) {
        delete state.posts[feed.id];
      }

      state.log.info(`${chalk.green(feed.id)} (${chalk.blue(data.length)} posts)`);
      next(err);
    });
  }, cb);
};
