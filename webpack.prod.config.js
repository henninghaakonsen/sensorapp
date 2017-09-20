var path = require('path');
var webpack = require('webpack');
var ignore = new webpack.IgnorePlugin(/\.svg$/);
var nodeModulesDir = path.resolve(__dirname, 'node_modules');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const port = process.env.PORT || 8080;

module.exports = {
  entry: {
    main: './scripts/main.js'
  },
  output: {
    publicPath: 'http://localhost:' + port + '/',
    filename: './server/public/js/[name].js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude: [nodeModulesDir] },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!sass') },
    ],
  },
  plugins: [
    ignore,
    new ExtractTextPlugin('./server/public/css/main.css')
  ],
};
