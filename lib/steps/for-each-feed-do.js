'use strict';

const async = require('async');

module.exports = (state, mkRunner, cb) => {
  const total = (state.feeds || []).length;
  async.forEachOfSeries(state.feeds || [], (feed, index, next) => {
    mkRunner({ feed }, index, total).run(err => {
      if (err) {
        state.log.error(err.message);
      }
      next();
    });
  }, cb);
};
