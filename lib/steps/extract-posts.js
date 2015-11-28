'use strict';

const async = require('async'),
      chalk = require('chalk'),
      blacklisted = [
        'http://benatkin.com/feed/',
        'http://blog.alicialiu.net/rss',
        'http://blog.nodejitsu.com/feed.xml',
        'http://blog.nodeknockout.com/rss',
        'http://blog.rodneyrehm.de/feeds/index.rss2',
        'http://blog.strongbackconsulting.com/feeds/posts/default',
        'http://braythwayt.com/atom.xml',
        'http://choorucode.com/feed/',
        'http://codegangsta.io/index.xml',
        'http://feeds.feedburner.com/dailyjs',
        'http://feeds.feedburner.com/tuxicity',
        'http://grinnick.com/posts.atom',
        'http://html5hub.com/feed/',
        'http://infoarena.ro/blog?action=rss',
        'http://justin.harmonize.fm/index.php/feed/',
        'http://laravel-news.com/feed/',
        'http://michaelochurch.wordpress.com/feed/',
        'http://onemoredigit.com/rss',
        'http://osteele.com/feed',
        'http://samsoff.es/posts.atom',
        'http://serverfault.com/feeds/question/232758',
        'http://tjholowaychuk.com/rss',
        'http://tomayko.com/feed',
        'http://tootallnate.net/feed.xml',
        'http://veewhois.com/feed.xml',
        'http://www.drperlmutter.com/feed/',
        'http://www.farnamstreetblog.com/feed/',
        'http://www.jamesaltucher.com/feed/',
        'http://www.reddit.com/r/angularjs/comments/26l8uu/digging_into_angulars_controller_as_syntax/.rss',
        'https://github.com/tj.atom',
        'https://github.com/toddmotto/angularjs-styleguide/commits/master.atom',
        'https://michaelochurch.wordpress.com/feed/',
        'https://www.bentasker.co.uk/?format=feed&type=rss',
        'https://www.reddit.com/r/vim/.rss'
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
