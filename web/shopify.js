import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2022-10";
import { SQLiteSessionStorage } from "@shopify/shopify-api/session-storage/sqlite";

const DB_PATH = `${process.cwd()}/database.sqlite`;

const shopify = shopifyApp({
  api: {
    // This should be replaced with your preferred storage strategy
    sessionStorage: new SQLiteSessionStorage(DB_PATH),
    restResources,
  },
});

export default shopify;
