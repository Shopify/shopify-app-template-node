import {shopifyApp} from '@shopify/shopify-app-express';
import {BillingInterval} from "@shopify/shopify-api";
import {restResources} from '@shopify/shopify-api/rest/admin/2022-10';
import {SQLiteSessionStorage} from '@shopify/shopify-api/session-storage/sqlite';

import {GDPRWebhookHandlers} from './gdpr.js';

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

const apiConfig = {
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
  billing: undefined,  // or replace with billingConfig above to enable example billing
  restResources,
};

const shopify = shopifyApp({
  api: apiConfig,
  webhooks: {
    handlers: GDPRWebhookHandlers,
  },
});

export default shopify;
