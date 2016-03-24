'use strict';

const Promise = require('bluebird').Promise;
const processors = {
  articleBody: require('./processors/base-processor')('#article-body'),
  benFrain: require('./processors/ben-frain'),
  blogContent: require('./processors/base-processor')('.blog-content'),
  contentId: require('./processors/base-processor')('#content'),
  entryContent: require('./processors/base-processor')('.entry-content'),
  detailPost: require('./processors/base-processor')('.detail-post'),
  mainTag: require('./processors/base-processor')('main'),
  medium: require('./processors/medium'),
  paulGraham: require('./processors/paul-graham')
};

function defaultProcessor(post) {
  return new Promise(resolve => resolve(post));
}

function linkMatches(post, url) {
  const link = post.realLink || post.link;
  return link.match(new RegExp(`^https?://${url}`));
}

function process(post, body) {
  if (linkMatches(post, 'medium.com')) {
    return processors.medium(post, body);
  } else if (linkMatches(post, 'm.signalvnoise.com')) {
    return processors.medium(post, body);
  } else if (linkMatches(post, 'medium.freecodecamp.com')) {
    return processors.medium(post, body);
  } else if (linkMatches(post, 'benfrain.com')) {
    return processors.benFrain(post, body);
  } else if (linkMatches(post, 'www.paulgraham.com')) {
    return processors.paulGraham(post, body);
  } else if (linkMatches(post, 'www.kdelemme.com')) {
    return processors.entryContent(post, body);
  } else if (linkMatches(post, 'blog.aaronbieber.com')) {
    return processors.entryContent(post, body);
  } else if (linkMatches(post, 'thenewcode.com')) {
    return processors.entryContent(post, body);
  } else if (linkMatches(post, 'bocoup.com')) {
    return processors.blogContent(post, body);
  } else if (linkMatches(post, 'www.creativebloq.com')) {
    return processors.articleBody(post, body);
  } else if (linkMatches(post, 'www.47deg.com')) {
    return processors.detailPost(post, body);
  } else if (linkMatches(post, 'www.iandevlin.com')) {
    return processors.mainTag(post, body);
  } else if (linkMatches(post, 'www.howardism.org')) {
    return processors.contentId(post, body);
  } else if (linkMatches(post, 'strongloop.com')) {
    return processors.entryContent(post, body);
  }

  return defaultProcessor(post, body);
}

module.exports = { process };
