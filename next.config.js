require("dotenv").config();
const webpack = require('webpack');
const { default: Shopify } = require('@shopify/shopify-api');

const apiKey =  JSON.stringify(Shopify.Context.API_KEY);

module.exports = {
  webpack: (config) => {
    const env = { API_KEY: apiKey };
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  },
};
