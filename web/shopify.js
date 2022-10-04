import {
  shopifyApi,
  BillingInterval,
  LATEST_API_VERSION
} from "@shopify/shopify-api";
import {restResources} from '@shopify/shopify-api/rest/admin/2022-10';
import {SQLiteSessionStorage} from '@shopify/shopify-api/session-storage/sqlite';

const DB_PATH = `${process.cwd()}/database.sqlite`;

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

const appConfig = {
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.HOST.replace(/https?:\/\//, ""),
  hostScheme: process.env.HOST.split("://")[0],
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
  billing: undefined,  // or replace with billingConfig above to enable example billing
  restResources,
};

const shopify = shopifyApi(appConfig);

export default shopify;
