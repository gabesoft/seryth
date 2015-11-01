module.exports = (state, opts, cb) => {
  state.db.mget(state.feedIds, (err, data) => {
    state.feeds = data.map(JSON.parse);
    cb(err);
  });
};
