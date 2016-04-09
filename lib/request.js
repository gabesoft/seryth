'use strict';

const request = require('request');

request.Request.prototype.setMaxListeners(1000);

module.exports = request.defaults({
  headers: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36'
  },
  pool: { maxSockets: Infinity },
  timeout: 30000,
  maxRedirects: 6,
  followRedirect: true
});
