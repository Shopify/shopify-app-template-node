// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import "@shopify/shopify-api/adapters/node";
import {
  shopifyApi,
  BillingInterval,
  LATEST_API_VERSION,
} from "@shopify/shopify-api";
import { SQLiteSessionStorage } from "@shopify/shopify-api/session-storage/sqlite";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { AppInstallations } from "./app_installations.js";

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;

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
  billing: undefined, // or replace with billingConfig above to enable example billing
};

const shopify = shopifyApi(appConfig);

shopify.webhooks.addHandler({
  topic: "APP_UNINSTALLED",
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop, shopify);
  },
});

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks(shopify, "/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const app = express();

  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(shopify.config.apiSecretKey));

  applyAuthMiddleware(shopify, app);

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());

  app.post("/api/webhooks", async (req, res) => {
    try {
      await shopify.webhooks.process({
        rawBody: JSON.stringify(req.body),
        rawRequest: req,
        rawResponse: res,
      });
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use("/api/*", verifyRequest(shopify, app));

  app.get("/api/products/count", async (req, res) => {
    const session = await shopify.session.getCurrent({
      isOnline: app.get("use-online-tokens"),
      rawRequest: req,
      rawResponse: res,
    });
    const { Product } = await import(
      `@shopify/shopify-api/rest/admin/${shopify.config.apiVersion}`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await shopify.session.getCurrent({
      isOnline: app.get("use-online-tokens"),
      rawRequest: req,
      rawResponse: res,
    });
    let status = 200;
    let error = null;

    try {
      await productCreator(session, shopify);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  app.use((req, res, next) => {
    const shop = shopify.utils.sanitizeShop(req.query.shop);
    if (shopify.config.isEmbeddedApp && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = shopify.utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop, shopify);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res, shopify, app);
    }

    if (shopify.config.isEmbeddedApp && req.query.embedded !== "1") {
      const embeddedUrl = await shopify.auth.getEmbeddedAppUrl({
        rawRequest: req,
        rawResponse: res,
      });

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html"
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
