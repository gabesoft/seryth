'use strict';

const Promise = require('bluebird').Promise;
const processors = {
  medium: require('./processors/medium'),
  benFrain: require('./processors/ben-frain'),
  paulGraham: require('./processors/paul-graham'),
  entryContent: require('./processors/entry-content')
};

function defaultProcessor(post) {
  return new Promise(resolve => resolve(post));
}

function linkMatches(post, url) {
  return post.link.match(new RegExp(`^https?://${url}`));
}

function process(post, body) {
  if (linkMatches(post, 'medium.com')) {
    return processors.medium(post, body);
  } else if (linkMatches(post, 'm.signalvnoise.com')) {
    return processors.medium(post, body);
  } else if (linkMatches(post, 'benfrain.com')) {
    return processors.benFrain(post, body);
  } else if (linkMatches(post, 'www.paulgraham.com')) {
    return processors.paulGraham(post, body);
  } else if (linkMatches(post, 'www.kdelemme.com')) {
    return processors.entryContent(post, body);
  } else if (linkMatches(post, 'blog.aaronbieber.com')) {
    return processors.entryContent(post, body);
  }

  return defaultProcessor(post, body);
}

module.exports = { process };
