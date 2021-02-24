const path = require('path');

module.exports = {
  output: {
    filename: '../public/index.js',
  },
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
};
