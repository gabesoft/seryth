'use strict';

const sanitizer = require('../sanitizer'),
      request = require('request'),
      chalk = require('chalk'),
      Promise = require('bluebird').Promise,
      jsdom = require('jsdom'),
      jquery = require('jquery'),
      toAbsoluteLink = require('../util').toAbsoluteLink;

function clean(post, name) {
  return new Promise((resolve, reject) => {
    sanitizer(post[name], post.realLink || post.link, (err, html) => {
      if (err) {
        reject(err);
      } else {
        post[name] = html;
        resolve(post);
      }
    });
  });
}

// TODO: move medium and other specialized processing to own files
function processMedium(post, body) {
  const opts = {
    FetchExternalResources: false,
    ProcessExternalResources: false,
    MutationEvents: false,
    QuerySelector: false
  };

  return new Promise((resolve, reject) => {
    try {
      jsdom.env({
        features: opts,
        html: body,
        url: post.realLink || post.link,
        done: (err, window) => {
          if (err) {
            reject(err);
          } else {
            const $ = jquery(window),
                  $doc = $(window.document),
                  html = $doc.find('article main').html();
            post.originalDescription = post.description;
            post.description = html || post.description;
            resolve(post);
          }
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function fetch(post) {
  return new Promise((resolve, reject) => {
    request.get(post.link, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        post.realLink = res.request.uri.href;

        if (post.link.match(/^https?:\/\/medium\.com/)) {
          resolve(processMedium(post, body));
        } else if (post.link.match(/^https:\/\/m.signalvnoise\.com/)) {
          resolve(processMedium(post, body));
        } else {
          resolve(post);
        }
      }
    });
  });
}

function processPost(feed, data) {
  const item = {
    author: data.author,
    comments: data.comments,
    date: data.date || new Date(),
    description: data.description,
    feedId: feed.id,
    guid: data.guid,
    image: data.image,
    link: toAbsoluteLink(data.link || data.guid),
    pubdate: data.pubdate,
    source: data.source,
    summary: data.summary,
    title: data.title || 'Untitled'
  };

  return fetch(item)
    .then(post => clean(post, 'description'))
    .then(post => clean(post, 'summary'));
}

module.exports = (state, opts, cb) => {
  const posts = state.posts,
        feed = state.feed || {},
        existing = state.postGuids || {};

  const promises = posts
          .filter(post => !existing[post.guid])
          .map(post => processPost(feed, post))
          .map(promise => Promise.resolve(promise).reflect());

  state.posts = [];

  Promise
    .all(promises)
    .each(promise => {
      if (promise.isFulfilled()) {
        const post = promise.value();
        state.posts.push(post);
        state.log.info(`processed post ${chalk.yellow(post.link || post.guid)}`);
      } else {
        const err = promise.reason();
        state.log.error(err.stack || err.message);
      }
    })
    .then(() => cb());
};
