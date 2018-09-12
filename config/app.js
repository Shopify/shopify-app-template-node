/* eslint-env node */
/* eslint-disable no-process-env */
const apiKey = process.env.SHOPIFY_API_KEY || 'shopify_app_api_key';
const secret = process.env.SHOPIFY_SECRET || 'shopify_app_secret';
const scopes = ['read_customers', 'write_customers', 'write_products'];

const hostName = process.env.HOST_NAME || '';

const config = {
  apiKey,
  secret,
  scopes,
  hostName,
};

export default config;
