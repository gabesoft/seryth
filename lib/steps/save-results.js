'use strict';

const eyes = require('eyes'),
      omit = require('lodash').omit,
      defaults = require('lodash').defaults,
      request = require('request'),
      async = require('async'),
      uriMap = {
        'http://vexorian.blogspot.com/feeds/posts/default': 'http://feeds.feedburner.com/VexorianProgrammingContestBlog',
        'http://www.devthought.com/feed/': 'http://feeds.feedburner.com/devthought',
        'http://www.catonmat.net/feed/': 'http://feeds.feedburner.com/catonmat',
        'http://lea.verou.me/feed/': 'http://feeds.feedburner.com/leaverou',
        'http://feedproxy.google.com/jstorimer': 'http://feeds.feedburner.com/jstorimer',
        'http://oli.me.uk/atom.xml': 'http://oli.me.uk/feed/',
        'http://blog.stevenlevithan.com/feed': 'http://feeds2.feedburner.com/badassery',
        'http://scotch.io/feed': 'http://feeds.feedblitz.com/scotch_io&x=1'
      };

module.exports = (state, _, cb) => {
  const url = state.conf('api:url'),
        feeds = state.feeds.filter(feed => (state.posts[feed.id] || []).length > 0);

  async.eachSeries(feeds, (feedData, next1) => {
    const feedOpts = {
      url: `${url}/feeds`,
      method: 'POST',
      body: omit(feedData, 'id'),
      json: true
    };

    if (uriMap[feedData.uri]) {
      feedOpts.body.uri = uriMap[feedData.uri];
    }

    request(feedOpts, (err1, _, feed) => {
      if (err1) { return next1(err1); }

      eyes.inspect(feed, 'feed');
      return async.eachSeries(state.posts[feedData.id], (postData, next2) => {
        const postOpts = {
          url: `${url}/posts`,
          method: 'POST',
          body: defaults({ feedId: feed.id }, omit(postData, 'feedUri', 'feedTitle', 'feedLink')),
          json: true
        };

        request(postOpts, (err2, _, post) => {
          next2(err2);
          eyes.inspect(post, 'post');
        });
      }, next1);
    });
  }, cb);
};