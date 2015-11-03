const eyes = require('eyes'),
      omit = require('lodash').omit,
      defaults = require('lodash').defaults,
      request = require('request'),
      async = require('async');

module.exports = (state, opts, cb) => {
  const url = state.conf('api:url'),
        feeds = state.feeds.filter(feed => (state.posts[feed.id] || []).length > 0);

  async.eachSeries(feeds, (feedData, feedNext) => {
    const feedOpts = {
      url: `${url}/feeds`,
      method: 'POST',
      body: omit(feedData, 'id'),
      json: true
    };

    request(feedOpts, (feedErr, response, feed) => {
      if (feedErr) { return feedNext(feedErr); }

      eyes.inspect(feed, 'feed');
      return async.eachSeries(state.posts[feedData.id], (postData, postNext) => {
        const postOpts = {
          url: `${url}/posts`,
          method: 'POST',
          body: defaults({ feedId: feed.id }, omit(postData, 'feedUri', 'feedTitle', 'feedLink')),
          json: true
        };

        request(postOpts, (postErr, res, post) => {
          postNext(postErr);
          eyes.inspect(post, 'post');
        });
      }, feedNext);
    });
  }, cb);
};
