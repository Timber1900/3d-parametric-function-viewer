const path = require('path');

module.exports = {
  output: {
    filename: '../public/renderer/index.js',
  },
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
};
