'use strict';

const Promise = require('bluebird').Promise,
      jsdom = require('jsdom'),
      jquery = require('jquery');

module.exports = function create(selector) {
  return function processPostBody(post, body) {
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
                    html = $doc.find(selector).html();
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
  };
};
