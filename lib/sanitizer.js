'use strict';

const jsdom = require('jsdom'),
      jquery = require('jquery'),
      url = require('url');

function relative(uri) {
  return !url.parse(uri).host;
}

function fullUrl(uri, baseUrl) {
  return relative(uri) ? url.resolve(baseUrl, uri) : uri;
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

function fixImages($doc, $, baseUrl) {
  $doc.find('img')
    .filter(function() { return relative($(this).attr('src')); })
    .each(function() {
      const $el = $(this),
            src = $el.attr('src');
      $el.attr('src', fullUrl(src, baseUrl));
    });
}

function fixRelativeUrls($doc, $, baseUrl) {
  $doc.find('a').each(function() {
    const link = $(this),
          href = link.attr('href');
    link.attr('href', fullUrl(href, baseUrl));
  });
}

function removeShareLinks($doc) {
  $doc.find('div.feedflare').remove();
}

function removeEmptyLinks($doc, $) {
  $doc.find('a')
    .filter(function() {
      return $(this).html().trim().length === 0;
    })
    .remove();
}

module.exports = (html, postUrl,  cb) => {
  const opts = {
    FetchExternalResources: false,
    ProcessExternalResources: false,
    MutationEvents: false,
    QuerySelector: false
  };

  function process(err, window) {
    if (err) {
      return cb(err, html);
    }

    const $ = jquery(window),
          $doc = $(window.document),
          uri = url.parse(postUrl),
          baseUrl = `${uri.protocol || 'http:'}//${uri.host}`;

    removeIframes($doc, $, baseUrl);
    removeScriptTags($doc, $, baseUrl);
    removeStylesheets($doc, $, baseUrl);
    fixImages($doc, $, baseUrl);
    fixRelativeUrls($doc, $, baseUrl);
    removeShareLinks($doc, $, baseUrl);
    removeEmptyLinks($doc, $, baseUrl);

    if (window.document.body) {
      return cb(null, window.document.body.innerHTML);
    } else {
      return cb(null, window.document.innerHTML);
    }
  }

  jsdom.env({
    features: opts,
    html: html,
    done: process
  });
};
