const react = require('@vitejs/plugin-react');

require('dotenv/config');

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  define: {
    'process.env.SHOPIFY_API_KEY': JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  plugins: [react()],
};
