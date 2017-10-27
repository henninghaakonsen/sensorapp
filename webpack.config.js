var webpack = require('webpack');
var ignore = new webpack.IgnorePlugin(/\.svg$/)

const port = process.env.PORT || 8080;

module.exports = {
  devtool: 'source-map',
  entry: {
    main: [
      "babel-polyfill",
      './scripts/main.js',
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server',
    ],
  },
  output: {
    publicPath: 'http://localhost:' + port + '/',
    filename: '/js/[name].js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['react-hot', 'babel?' + JSON.stringify({presets: ['react', 'env', 'stage-0']})], exclude: /node_modules/ },
      { test: /\.scss$/, loaders: ['style', 'css', 'postcss'] },
    ],
  },
  plugins: [ignore]
};
