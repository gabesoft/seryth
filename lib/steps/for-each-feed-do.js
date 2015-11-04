'use strict';

const async = require('async');

module.exports = (state, mkRunner, cb) => {
  async.each(state.feeds || [], (feed, next) => {
    mkRunner({ feed }).run(err => {
      if (err) {
        state.log.error(err.message);
      }
      next(err);
    });
  }, cb);
};
