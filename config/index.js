/* eslint-env node */
/* eslint-disable no-process-env */
const {readFileSync} = require('fs-extra');
const dotenv = require('dotenv');

dotenv.config();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;
const DEV = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || '8081';
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || 'shopify.com';

const tunnelFile = 'config/tunnel.pid';

function getTunnelUrl() {
  return readFileSync(tunnelFile).toString();
}

module.exports = {
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  SHOPIFY_DOMAIN,
  PORT,
  DEV,
  tunnelFile,
  getTunnelUrl,
};
