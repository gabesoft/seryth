module.exports = (state, opts, cb) => {
  state.db.keys('feed:*', (err, data) => {
    state.feedIds = data.sort();
    cb(err);
  });
};
