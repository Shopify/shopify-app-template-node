const react = require('@vitejs/plugin-react');

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  define: {
    'process.env.SHOPIFY_API_KEY': JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  plugins: [react()],
};
