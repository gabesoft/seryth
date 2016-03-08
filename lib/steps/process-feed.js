'use strict';

const toAbsoluteLink = require('../util').toAbsoluteLink;

module.exports = (state, opts, cb) => {
  const meta = state.meta || {},
        feed = state.feed || {};

  feed.title = (meta.title || feed.title || feed.uri);
  feed.description = meta.description;
  feed.date = meta.date;
  feed.link = toAbsoluteLink(meta.link || feed.uri);
  feed.author = meta.author;
  feed.language = meta.language;
  feed.image = meta.image;
  feed.favicon = meta.favicon;
  feed.generator = meta.generator;

  cb();
};
