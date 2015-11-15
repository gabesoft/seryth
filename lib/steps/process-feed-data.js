'use strict';

const async = require('async'),
      omit = require('lodash').omit,
      clean = require('../sanitizer'),
      chalk = require('chalk'),
      eyes = require('eyes'),
      url = require('url');

function ensureAbsoluteLink(link) {
  const relative = !url.parse(link).protocol;
  return relative ? `http://${link}` : link;
}

function extractTags(categories) {
  return (categories || []).map(cat => {
    return cat.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  });
}

module.exports = (state, opts, cb) => {
  const posts = state.posts,
        meta = state.meta || {},
        feed = state.feed || {},
        existing = state.postGuids || {};

  feed.title = (meta.title || feed.title || feed.uri);
  feed.description = meta.description;
  feed.date = meta.date;
  feed.link = ensureAbsoluteLink(meta.link || feed.uri);
  feed.author = meta.author;
  feed.language = meta.language;
  feed.image = meta.image;
  feed.favicon = meta.favicon;
  feed.generator = meta.generator;
  feed.tags = (feed.tags || extractTags(feed.categories));

  state.posts = [];

  async.each(posts, (data, next) => {
    if (existing[data.guid]) {
      state.log.warn(`post ${chalk.yellow(data.guid)} already exists`);
      return next();
    }

    state.log.info(`processing post ${chalk.yellow(data.link || data.guid)}`);
    const post = {
      author: data.author,
      comments: data.comments,
      date: data.date || new Date(),
      description: null,
      feedId: state.feed.id,
      guid: data.guid,
      image: data.image,
      link: ensureAbsoluteLink(data.link || data.guid),
      pubdate: data.pubdate,
      source: data.source,
      summary: null,
      tags: extractTags(data.categories),
      title: data.title || 'Untitled'
    };

    clean(data.description, post.link, (errd, description) => {
      if (errd) {
        state.log.error(errd.stack || errd.message);
        eyes.inspect(data.description);
      }

      post.description = description;

      clean(data.summary, post.link, (errs, summary) => {
        if (errs) {
          state.log.error(errs.stack || errs.message);
          eyes.inspect(data.summary);
        }

        post.summary = summary;

        if (state.posts.length === 1) {
          eyes.inspect(omit(state.posts[0], 'description'));
          eyes.inspect(state.posts[0].description);
        }

        state.posts.push(post);
        next();
      });
    });
  }, cb);
};
