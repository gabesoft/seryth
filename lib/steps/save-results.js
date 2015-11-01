const eyes = require('eyes');

module.exports = (state, opts, cb) => {
  eyes.inspect(state.feeds, 'feeds');
  eyes.inspect(state.posts, 'posts');
  cb();
};
