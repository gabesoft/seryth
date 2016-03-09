'use strict';

const Promise = require('bluebird').Promise;
const processors = {
  medium: require('./processors/medium')
};

function defaultProcessor(post) {
  return new Promise(resolve => resolve(post));
}

function process(post, body) {
  if (post.link.match(/^https?:\/\/medium\.com/)) {
    return processors.medium(post, body);
  } else if (post.link.match(/^https:\/\/m.signalvnoise\.com/)) {
    return processors.medium(post, body);
  }

  return defaultProcessor(post, body);
}

module.exports = { process };
