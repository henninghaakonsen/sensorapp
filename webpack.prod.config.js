var path = require('path');
var webpack = require('webpack');
var ignore = new webpack.IgnorePlugin(/\.svg$/);
var nodeModulesDir = path.resolve(__dirname, 'node_modules');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const port = process.env.PORT || 9000;

module.exports = {
  entry: [
    "babel-polyfill",
    './scripts/main.js'
  ],
  output: {
    publicPath: 'http://localhost:' + port + '/',
    filename: '../sensorserver/src/app/public/[name].js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude: [nodeModulesDir] },
      { test: /\.css$/, loaders: ['style', 'css', 'postcss'] },
      { test: /\.(html)$/,
        loader: 'html-loader',
        options: {
          attrs: [':data-src']
        }
      },
    ],
  },
  plugins: [
    ignore,
    new ExtractTextPlugin('./server/public/css/main.css')
  ],
};
