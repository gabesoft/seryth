'use strict';

const jsdom = require('jsdom'),
      jquery = require('jquery'),
      url = require('url');

function relative(uri) {
  return !url.parse(uri).host;
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

function cleanImages($doc, context) {
  $doc.find('img')
    .filter(() => relative(context.$(this).attr('src')))
    .remove();
}

function fixRelativeUrls($doc, context) {
  $doc.find('a').each(function() {
    const link = context.$(this),
          href = link.attr('href'),
          uri = relative(href) ? url.resolve(context.baseUrl, href) : href;
    link.attr('href', uri);
  });
}

function removeShareLinks($doc) {

}

function removeEmptyLinks($doc) {

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
          context = {
            $: $,
            $doc: $doc,
            baseUrl: `${uri.protocol || 'http:'}//${uri.host}`
          };

    removeIframes($doc, context);
    removeScriptTags($doc, context);
    removeStylesheets($doc, context);
    cleanImages($doc, context);
    fixRelativeUrls($doc, context);
    removeShareLinks($doc, context);
    removeEmptyLinks($doc, context);

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
