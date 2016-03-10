'use strict';

const Promise = require('bluebird').Promise;
const processors = {
  medium: require('./processors/medium'),
  benFrain: require('./processors/ben-frain'),
  paulGraham: require('./processors/paul-graham')
};

function defaultProcessor(post) {
  return new Promise(resolve => resolve(post));
}

function process(post, body) {
  if (post.link.match(/^https?:\/\/medium\.com/)) {
    return processors.medium(post, body);
  } else if (post.link.match(/^https?:\/\/m.signalvnoise\.com/)) {
    return processors.medium(post, body);
  } else if (post.link.match(/^https?:\/\/benfrain\.com/)) {
    return processors.benFrain(post, body);
  } else if (post.link.match(/http:\/\/www.paulgraham\.com/)) {
    return processors.paulGraham(post, body);
  }

  return defaultProcessor(post, body);
}

module.exports = { process };
