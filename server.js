'use strict';

const Hapi = require('hapi'),
      server = new Hapi.Server({}),

      conf = require('./config/store');

function saveFeed(request, response) {

}

// routes
// - fetch feed
// - save feed

server.route({
  method: 'POST',
  path: '/feeds',
  handler: saveFeed
});

server.connection({
  port: conf.get('app:port') || 8008
});


// TODO: start server
//       start tasks
