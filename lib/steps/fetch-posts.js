'use strict';

const request = require('request'),
      chalk = require('chalk'),
      eyes = require('eyes'),
      Iconv = require('iconv').Iconv,
      FeedParser = require('feedparser');

module.exports = (state, options, cb) => {
  state.posts = [];

  const parser = new FeedParser();
  const feed = state.feed;
  const opts = {
    uri: feed.uri,
    headers: {
      'If-Modified-Since': feed.lastModified || '',
      'If-None-Match': feed.etag || '',
      'accept': 'text/html,application/xhtml+xml',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
    },
    timeout: 60000,
    pool: false
  };
  const req = request.get(opts);

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
    state.log.error(`failed to fetch posts for ${chalk.yellow(feed.uri)} with error: ${chalk.red(err.message)}`);
  });
  req.on('response', function onResponse(response) {
    let res = response;

    if (res.statusCode !== 200) {
      this.emit('error', new Error(`Invalid status code ${res.statusCode}`));
    } else {
      const charset = getParams(res.headers['content-type'] || '').charset;
      res = maybeTranslate(res, charset);
      res.pipe(parser);
    }
  });

  parser.on('error', err => {
    state.log.error(`failed to fetch posts for ${chalk.yellow(feed.uri)} with error: ${chalk.red(err.message)}`);
  });
  parser.on('end', err => {
    if (err) {
      state.log.error(`failed to fetch posts for ${feed.uri}`);
    } else {
      state.log.info(`fetched ${chalk.blue(state.posts.length)} posts for ${chalk.green(feed.uri)}`);
      // eyes.inspect(state.posts);
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
