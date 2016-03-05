'use strict';

const request = require('../request'),
      chalk = require('chalk'),
      eyes = require('eyes'),
      Iconv = require('iconv').Iconv,
      FeedParser = require('feedparser');

module.exports = (state, options, cb) => {
  state.posts = [];

  const feed = state.feed,
        parser = new FeedParser({ feedurl: feed.uri, addmeta: false }),
        opts = {
          uri: feed.uri,
          timeout: state.conf('fetch-feed:timeout'),
          headers: {
            'If-Modified-Since': feed.lastModified || '',
            'If-None-Match': feed.etag || ''
          }
        },
        req = request.get(opts);

  function getParams(str) {
    return str.split(';').reduce((ps, param) => {
      const parts = param.split('=').map(part => part.trim());
      if (parts.length === 2) {
        ps[parts[0]] = parts[1];
      }
      return ps;
    }, {});
  }

  function maybeTranslate(res, charset) {
    let stream = res;

    if (charset && !/utf-*8/i.test(charset)) {
      try {
        const iconv = new Iconv(charset, 'utf-8');
        state.log.info(`converting from charset ${charset} to utf-8`);
        iconv.on('error', err => stream.emit('error', err));
        stream = stream.pipe(iconv);
      } catch (err) {
        stream.emit('error', err);
      }
    }

    return stream;
  }

  req.on('error', err => {
    const feedUriStr = chalk.yellow(feed.uri);
    const message = chalk.red(err.message);
    state.log.error(`failed to fetch posts for ${feedUriStr} with error: ${message}`);
    cb(err);
  });

  req.on('response', function onResponse(response) {
    let res = response;

    if (res.statusCode === 304) {
      state.log.warn(`feed ${feed.uri} not modified`);
    } else if (res.statusCode !== 200) {
      this.emit('error', new Error(`Invalid status code ${res.statusCode}`));
    } else {
      const charset = getParams(res.headers['content-type'] || '').charset;

      eyes.inspect(res.headers, 'headers');

      feed.data = {
        'last-modified': res.headers['last-modified'],
        etag: res.headers.etag
      };

      res = maybeTranslate(res, charset);
      res.pipe(parser);
    }
  });

  parser.on('meta', meta => {
    state.meta = meta;
  });

  parser.on('error', err => {
    const feedUriStr = chalk.yellow(feed.uri);
    const message = chalk.red(err.message);
    state.log.error(`failed to parse posts for ${feedUriStr} with error: ${message}`);
    cb(err);
  });

  parser.on('end', err => {
    if (err) {
      state.log.error(`failed to fetch posts for ${feed.uri}`);
      feed.newPostsCount = 0;
    } else {
      const postsLengthStr = chalk.blue(state.posts.length);
      const feedUriStr = chalk.green(feed.uri);
      state.log.info(`fetched ${postsLengthStr} posts for ${feedUriStr}`);
      feed.newPostsCount = state.posts.length;
    }
    cb(err);
  });

  parser.on('readable', function onReadable() {
    let post = true;

    while (post) {
      post = this.read();
      if (post) {
        state.posts.push(post);
      }
    }
  });
};
