import "@shopify/shopify-api/adapters/node";
import {
  shopifyApi,
  BillingInterval,
  LATEST_API_VERSION,
  LogSeverity,
} from "@shopify/shopify-api";
let { restResources } = await import(
  `@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`
);

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const apiConfig = {
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  hostScheme: process.env.HOST.split("://")[0],
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  ...(process.env.SHOP_CUSTOM_DOMAIN && {
    customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN],
  }),
  billing: undefined, // or replace with billingConfig above to enable example billing
  restResources,
  logger: {
    level: LogSeverity.Debug,
  },
};

const shopify = shopifyApi(apiConfig);
const USE_ONLINE_TOKENS = false;

export default shopify;
export { USE_ONLINE_TOKENS };
