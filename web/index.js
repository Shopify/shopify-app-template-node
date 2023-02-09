// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import Koa from "koa";
import Router from "koa-router";
import koaStatic from "koa-static";
import bodyParser from "koa-bodyparser";
import { DeliveryMethod } from "@shopify/shopify-api";
import shopify, { USE_ONLINE_TOKENS } from "./shopify.js";
import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { AppInstallations } from "./app_installations.js";
import { sqliteSessionStorage } from "./sqlite-session-storage.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const INDEX_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist/`
    : `${process.cwd()}/frontend/`;

await shopify.webhooks.addHandlers({
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (_topic, shop, _body, _webhookId) => {
      await AppInstallations.delete(shop);
    },
  },
});

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

const app = new Koa();
app.use(bodyParser());
const router = new Router();

app.keys = [shopify.config.apiSecretKey];
app.use(router.routes());
app.use(router.allowedMethods());

applyAuthMiddleware(router);

router.post("/api/webhooks", async (ctx, next) => {
  try {
    // ctx.respond = false;
    await shopify.webhooks.process({
      rawBody: ctx.request.rawBody,
      rawRequest: ctx.req,
      rawResponse: ctx.res,
    });
    console.log(`Webhook processed, returned status code 200`);
  } catch (error) {
    console.log(`Failed to process webhook: ${error.message}`);
    if (!ctx.headerSent) {
      ctx.status = 500;
      ctx.body = error.message;
    }
  }
});

router.get("/api/products/count", verifyRequest(), async (ctx, _next) => {
  console.log("DEBUG: /api/products/count, ctx.request.url: ", ctx.request.url);
  const sessionId = await shopify.session.getCurrentId({
    rawRequest: ctx.req,
    rawResponse: ctx.res,
    isOnline: USE_ONLINE_TOKENS,
  });
  const session = await sqliteSessionStorage.loadSession(sessionId);

  const countData = await shopify.rest.Product.count({ session });
  ctx.status = 200;
  ctx.body = countData;
});

router.get("/api/products/create", verifyRequest(), async (ctx, _next) => {
  console.log(
    "DEBUG: /api/products/create, ctx.request.url: ",
    ctx.request.url
  );

  const sessionId = await shopify.session.getCurrentId({
    rawRequest: ctx.req,
    rawResponse: ctx.res,
    isOnline: USE_ONLINE_TOKENS,
  });
  const session = await sqliteSessionStorage.loadSession(sessionId);
  let status = 200;
  let error = null;

  try {
    await productCreator(session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  ctx.status = status;
  ctx.body = { success: status === 200, error };
});

app.use(async (ctx, next) => {
  console.log("DEBUG: adding CSP header, ctx.request.url: ", ctx.request.url);
  const shop = shopify.utils.sanitizeShop(ctx.request.query.shop);
  if (shopify.config.isEmbeddedApp && shop) {
    ctx.set(
      "Content-Security-Policy",
      `frame-ancestors https://${encodeURIComponent(
        shop
      )} https://admin.shopify.com;`
    );
  } else {
    ctx.set("Content-Security-Policy", `frame-ancestors 'none';`);
  }
  await next();
});

app.use(koaStatic(INDEX_PATH, { index: false }));

router.all("/", async (ctx, next) => {
  console.log("DEBUG: /, ctx.request.url: ", ctx.request.url);
  if (typeof ctx.request.query.shop !== "string") {
    ctx.status = 500;
    ctx.body = "No shop provided";
    return;
  }

  const shop = shopify.utils.sanitizeShop(ctx.request.query.shop);
  const appInstalled = await AppInstallations.includes(shop);

  if (!appInstalled && !ctx.request.originalUrl.match(/^\/exitiframe/i)) {
    return redirectToAuth(ctx);
  }

  if (shopify.config.isEmbeddedApp && ctx.request.query.embedded !== "1") {
    const embeddedUrl = await shopify.auth.getEmbeddedAppUrl({
      rawRequest: ctx.req,
      rawResponse: ctx.res,
    });

    return ctx.redirect(embeddedUrl + ctx.request.path);
  }

  const htmlFile = join(INDEX_PATH, "index.html");

  ctx.status = 200;
  ctx.set("Content-Type", "text/html");
  ctx.body = readFileSync(htmlFile);
});

app.listen(PORT);
