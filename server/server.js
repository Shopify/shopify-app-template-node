import "@babel/polyfill";
import dotenv from "dotenv";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import Router from "koa-router";
import koaWebpack from "koa-webpack";
import serveStatic from "koa-static";
import fs from "fs";
import path from "path";
import verifyRequest from "./middlewares/verifyRequest";

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8081;
const webpackConfig = require("../webpack.config.js");
const dev = process.env.NODE_ENV !== "production";

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.Unstable,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/webhooks",
  webhookHandler: async (topic, shop, body) =>
    delete ACTIVE_SHOPIFY_SHOPS[shop],
});

// Simple helper to replace values in an HTML file in the views folder. If you're using multiple server-side rendered
// pages, you might want to consider adding a proper view renderer to your project.
function renderView(file, vars) {
  let content = fs.readFileSync(path.join(__dirname, "views", `${file}.html`), {
    encoding: "utf-8",
  });

  Object.keys(vars).forEach((key) => {
    const regexp = new RegExp(`{{ ${key} }}`, "g");
    content = content.replace(regexp, vars[key] || "");
  });

  return content;
}

const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";
const USE_ONLINE_TOKENS = true;

async function createAppServer() {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];

  let middleware;
  if (dev) {
    middleware = await koaWebpack({
      config: { ...webpackConfig, mode: process.env.NODE_ENV },
    });
    server.use(middleware);
  }

  router.get("/auth/toplevel", async (ctx) => {
    ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE, "1", {
      signed: true,
      httpOnly: true,
      sameSite: "strict",
    });

    ctx.response.type = "text/html";
    ctx.response.body = renderView("top_level", {
      apiKey: Shopify.Context.API_KEY,
      hostName: Shopify.Context.HOST_NAME,
      shop: ctx.query.shop,
    });
  });

  router.get("/auth", async (ctx) => {
    if (!ctx.cookies.get(TOP_LEVEL_OAUTH_COOKIE)) {
      ctx.redirect(`/auth/toplevel?shop=${ctx.query.shop}`);
      return;
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
      ctx.req,
      ctx.res,
      ctx.query.shop,
      "/auth/callback",
      USE_ONLINE_TOKENS
    );

    ctx.redirect(redirectUrl);
  });

  router.get("/auth/callback", async (ctx) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        ctx.req,
        ctx.res,
        ctx.query
      );

      const host = ctx.query.host;
      ACTIVE_SHOPIFY_SHOPS[session.shop] = session.scope;

      const response = await Shopify.Webhooks.Registry.register({
        shop: session.shop,
        accessToken: session.accessToken,
        topic: "APP_UNINSTALLED",
        path: "/webhooks",
      });

      if (!response["APP_UNINSTALLED"].success) {
        console.log(
          `Failed to register APP_UNINSTALLED webhook: ${response.result}`
        );
      }

      // Redirect to app with shop parameter upon auth
      ctx.redirect(`/?shop=${session.shop}&host=${host}`);
    } catch (e) {
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          ctx.throw(400, e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          ctx.redirect(`/auth?shop=${ctx.query.shop}`);
          break;
        default:
          ctx.throw(500, e.message);
          break;
      }
    }
  });

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ isOnline: USE_ONLINE_TOKENS, returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  if (!dev) {
    server.use(serveStatic(path.resolve(__dirname, "../dist")));
  }
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      ctx.response.type = "html";
      if (dev) {
        ctx.response.body = middleware.devMiddleware.fileSystem.createReadStream(
          path.resolve(webpackConfig.output.path, "index.html")
        );
      } else {
        ctx.response.body = fs.readFileSync(
          path.resolve(__dirname, "../dist/client/index.html")
        );
      }
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}

createAppServer();
