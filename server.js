'use strict';

const Hapi = require('hapi'),
      server = new Hapi.Server({}),
      async = require('async'),
      chalk = require('chalk'),
      Logger = require('srunner/logger').Logger,
      log = new Logger(),
      get = require('./lib/get-feed'),
      updateFeeds = require('./lib/update'),
      conf = require('./config/store'),
      moment = require('moment'),
      interval = moment.duration(
        conf.get('update:interval:value'),
        conf.get('update:interval:unit'));

function getFeed(request, reply) {
  get({ feedUri: request.query.uri }, (err, feed) => {
    if (err) {
      reply.boom(err);
    } else {
      reply(feed);
    }
  });
}

function loadRoutes(cb) {
  server.route({
    method: 'GET',
    path: '/feeds',
    handler: getFeed
  });
  cb();
}

function startUpdate() {
  log.info('starting feeds update');
  updateFeeds(null, err => {
    log.info('feeds update completed');
    if (err) log.error(err.message);
    log.info(`going to sleep for ${chalk.blue(interval.asMinutes())} minutes`);
    setTimeout(startUpdate, interval.asMilliseconds());
  });
}

function startTasks(cb) {
  startUpdate();
  cb();
}

function registerPlugins(cb) {
  server.register([{
    register: require('http-status-decorator')
  }, {
    register: require('good'),
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: { log: '*', response: '*', error: '*' },
        config: { format: 'hh:mm:ss.SSS' }
      }]
    }
  }], cb);
}

function setupServer(cb) {
  server.connection({
    port: conf.get('app:port') || 8008
  });
  cb();
}

function startServer(cb) {
  server.start(err => {
    log.info(`server started at ${chalk.blue(server.info.uri)}`);
    cb(err);
  });
}

async.series([
  setupServer, loadRoutes, registerPlugins, startServer, startTasks
], err => {
  if (err) {
    log.error(err.stack || err.message);
    throw err;
  }
});
