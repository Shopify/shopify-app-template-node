const withCSS = require('@zeit/next-css');
const webpack = require('webpack');

module.exports = withCSS({
  webpack: (config) => {
    const env = { SHOPIFY_API_KEY: JSON.stringify(process.env.SHOPIFY_API_KEY) };
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  },
});
