// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyUrlData from "@fastify/url-data";
import fastifyCookie from "@fastify/cookie";
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

const fastify = Fastify({
  logger: false,
});
fastify.register(fastifyUrlData);

fastify.removeContentTypeParser("application/json");
fastify.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  function (_req, body, done) {
    try {
      var newBody = {
        raw: body,
        parsed: JSON.parse(body),
      };
      done(null, newBody);
    } catch (error) {
      error.statusCode = 400;
      done(error, undefined);
    }
  }
);

fastify.register(fastifyCookie, {
  secret: shopify.config.apiSecretKey,
});

fastify.register(applyAuthMiddleware);

fastify.post("/api/webhooks", async (request, reply) => {
  try {
    await shopify.webhooks.process({
      rawBody: request.body.raw,
      rawRequest: request.raw,
      rawResponse: reply.raw,
    });
    console.log(`Webhook processed, returned status code 200`);
  } catch (error) {
    console.log(`Failed to process webhook: ${error.message}`);
    if (!reply.sent) {
      reply.status(500).send(error.message);
    }
  }
});

// All /api endpoints will require an active session
fastify.addHook("preHandler", async (request, reply) => {
  console.log(
    `DEBUG: preHandler - check if "/api/", exclude "/api/auth" and "/api/webhooks", ${request.url}`
  );
  if (
    request.url.match(/^\/api\//i) &&
    !request.url.match(/^\/api\/auth/i) &&
    !request.url.match(/^\/api\/webhooks/i)
  ) {
    verifyRequest(request, reply);
  }
});

fastify.get("/api/products/count", async (request, reply) => {
  console.log(`DEBUG: GET /api/products/count, ${request.url}`);

  const sessionId = await shopify.session.getCurrentId({
    rawRequest: request.raw,
    rawResponse: reply.raw,
    isOnline: USE_ONLINE_TOKENS,
  });
  const session = await sqliteSessionStorage.loadSession(sessionId);

  const countData = await shopify.rest.Product.count({ session });
  reply.code(200).send(countData);
});

fastify.get("/api/products/create", async (request, reply) => {
  console.log(`DEBUG: GET /api/products/create, ${request.url}`);
  const sessionId = await shopify.session.getCurrentId({
    rawRequest: request.raw,
    rawResponse: reply.raw,
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
  reply.code(status).send({ success: status === 200, error });
});

fastify.addHook("preHandler", async (request, reply) => {
  console.log(`DEBUG: preHandler - setting CSP header, ${request.url}`);
  const shop = shopify.utils.sanitizeShop(request.query.shop);
  if (shopify.config.isEmbeddedApp && shop) {
    reply.header(
      "Content-Security-Policy",
      `frame-ancestors https://${encodeURIComponent(
        shop
      )} https://admin.shopify.com;`
    );
  } else {
    reply.header("Content-Security-Policy", `frame-ancestors 'none';`);
  }
});

fastify.get("/", async (request, reply) => {
  console.log(`DEBUG: GET /, ${request.url}`);
  if (typeof request.query.shop !== "string") {
    reply.code(500).send("No shop provided");
    return;
  }

  const shop = shopify.utils.sanitizeShop(request.query.shop);
  const appInstalled = await AppInstallations.includes(shop);

  if (!appInstalled && !request.url.match(/^\/exitiframe/i)) {
    await redirectToAuth(request, reply);
    return;
  }

  if (shopify.config.isEmbeddedApp && request.query.embedded !== "1") {
    const embeddedUrl = await shopify.auth.getEmbeddedAppUrl({
      rawRequest: request.raw,
      rawResponse: reply.raw,
    });

    console.log(
      `DEBUG: redirecting to embedded app, ${
        embeddedUrl + request.urlData("path")
      }`
    );
    reply.redirect(embeddedUrl + request.urlData("path"));
    return;
  }

  const htmlFile = join(INDEX_PATH, "index.html");
  console.log(`DEBUG: serving ${htmlFile}`);

  reply
    .code(200)
    .header("Content-Type", "text/html")
    .send(readFileSync(htmlFile));
  return;
});

fastify.register(fastifyStatic, {
  root: INDEX_PATH,
  index: false,
});

// Run the server!
fastify.listen({ port: PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Fastify Server is now listening on ${address}`);
});
