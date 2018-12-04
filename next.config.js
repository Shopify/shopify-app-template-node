const withCSS = require('@zeit/next-css');
const webpack = require('webpack');

module.exports = withCSS({
  webpack: (config) => {
    config.plugins.push(new webpack.DefinePlugin(process.env));
    return config;
  },
});
