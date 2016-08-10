'use strict';

const url = require('url');

module.exports = {
  toAbsoluteLink: link => {
    if (!link) {
      return link;
    }
    const relative = !url.parse(link).protocol;
    return relative ? `http://${link.replace(/^\/\//, '')}` : link;
  }
};
