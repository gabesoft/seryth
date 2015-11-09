'use strict';

const async = require('async'),
      omit = require('lodash').omit,
      clean = require('../sanitizer'),
      eyes = require('eyes'),
      url = require('url');

function ensureAbsoluteLink(link) {
  const relative = !url.parse(link).host;
  return relative ? `http://${link}` : link;
}

function extractTags(categories) {
  // TODO: implement

  return [];
}

module.exports = (state, opts, cb) => {
  const posts = state.posts;

  state.posts = [];

  async.each(posts, (data, next) => {
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

    clean(data.description, post.link, (descriptionErr, description) => {
      if (descriptionErr) {
        state.log.error(descriptionErr.message);
      }

      post.description = description;

      clean(data.summary, post.link, (summaryErr, summary) => {
        if (summaryErr) {
          state.log.error(summaryErr.message);
        }

        post.summary = summary;

        if (state.posts.length === 1) {
          eyes.inspect(omit(state.posts[0], 'description'));
          eyes.inspect(state.posts[0].description);
        }

        next();
      });
    });
  }, cb);
};
