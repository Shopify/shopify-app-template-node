/* eslint-env node */
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const {ip, port, cdnUrl} = require('./config/server');

const tests = path.join(__dirname, 'tests');

module.exports = function sewingKitConfig(plugins) {
  return {
    name: 'your-app-name',
    plugins: [
      plugins.devServer({
        ip,
        port,
      }),
      plugins.cdn(cdnUrl),
      plugins.vendors([
        'react',
        'react-dom',
        'react-router',
        'react-router-dom',
        '@shopify/javascript-utilities',
        '@shopify/polaris',
        '@shopify/react-compose',
        '@shopify/react-utilities',
        'graphql',
        'react-apollo',
        'apollo-boost',
      ]),
      plugins.jest((config) => {
        config.setupFiles.push(path.join(tests, 'setup.ts'));
        config.setupTestFrameworkScriptFile =
          './node_modules/jest-enzyme/lib/index.js';
        return config;
      }),
      plugins.graphql({
        schema: `https://app.myshopify.com/services/graphql/introspection/merchant?api_client_api_key=${process.env.SHOPIFY_API_KEY}`,
      }),
    ],
  };
};
