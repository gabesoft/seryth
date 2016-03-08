'use strict';

const url = require('url');

module.exports = {
  toAbsoluteLink: link => {
    const relative = !url.parse(link).protocol;
    return relative ? `http://${link}` : link;
  }
};
