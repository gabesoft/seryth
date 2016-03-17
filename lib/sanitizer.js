'use strict';

const jsdom = require('jsdom'),
      jquery = require('jquery'),
      url = require('url');

function relative(uri) {
  return !url.parse(uri || '').host;
}

function fullUrl(uri, baseUrl) {
  return (uri && relative(uri)) ? url.resolve(baseUrl, uri) : uri;
}

function removeIframes($doc) {
  $doc.find('iframe').remove();
}

function removeScriptTags($doc) {
  $doc.find('script').remove();
}

function removeStylesheets($doc) {
  $doc.find('link[rel=stylesheet]').remove();
  $doc.find('style').remove();
}

function fixImgUrlAttribute($doc, $, baseUrl, name) {
  $doc.find('img')
    .filter((_, el) => relative($(el).attr(name)))
    .each((_, el) => {
      const $el = $(el),
            attr = $el.attr(name);
      $el.attr(name, fullUrl(attr, baseUrl));
    });
}

function fixImages($doc, $, baseUrl) {
  fixImgUrlAttribute($doc, $, baseUrl, 'src');
  fixImgUrlAttribute($doc, $, baseUrl, 'srcset');
}

function fixRelativeUrls($doc, $, baseUrl) {
  $doc.find('a').each((_, el) => {
    const link = $(el),
          href = link.attr('href');
    link.attr('href', fullUrl(href, baseUrl));
  });
}

function removeShareLinks($doc) {
  $doc.find('div.feedflare').remove();
}

function removeEmptyLinks($doc, $) {
  $doc.find('a')
    .filter((_, el) => $(el).html().trim().length === 0)
    .remove();
}

module.exports = (html, postUrl, cb) => {
  const opts = {
    FetchExternalResources: false,
    ProcessExternalResources: false,
    MutationEvents: false,
    QuerySelector: false
  };

  if (!postUrl) {
    return cb(new Error(`Invalid post url ${postUrl}`));
  }

  function process(err, window) {
    if (err) { return cb(err, html); }

    const $ = jquery(window),
          $doc = $(window.document);

    removeIframes($doc, $, postUrl);
    removeScriptTags($doc, $, postUrl);
    removeStylesheets($doc, $, postUrl);
    fixImages($doc, $, postUrl);
    fixRelativeUrls($doc, $, postUrl);
    removeShareLinks($doc, $, postUrl);
    removeEmptyLinks($doc, $, postUrl);

    if (window.document.body) {
      cb(null, window.document.body.innerHTML);
    } else {
      cb(null, window.document.innerHTML);
    }
  }

  try {
    jsdom.env({
      features: opts,
      html,
      done: process,
      url: postUrl
    });
  } catch (jsdomErr) {
    cb(jsdomErr, html);
  }
};

