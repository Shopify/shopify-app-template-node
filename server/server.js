import "@babel/polyfill";
import dotenv from "dotenv";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import fs from "fs";
import path from "path";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import verifyRequest from "./middlewares/verifyRequest";

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8081;
const webpackConfig = require("../webpack.config.js");
const __DEV__ = process.env.NODE_ENV !== "production";

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
  const app = require("express")();
  const compiler = webpack(webpackConfig);
  const cookieParser = require("cookie-parser");
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    })
  );

  app.get("/auth/toplevel", async (req, res) => {
    res.cookie(TOP_LEVEL_OAUTH_COOKIE, "1", {
      signed: true,
      httpOnly: true,
      sameSite: "strict",
    });

    res.set("Content-Type", "text/html");

    res.send(
      renderView("top_level", {
        apiKey: Shopify.Context.API_KEY,
        hostName: Shopify.Context.HOST_NAME,
        shop: req.query.shop,
      })
    );
  });

  app.get("/auth", async (req, res) => {
    if (!req.signedCookies.shopify_top_level_oauth) {
      res.redirect(`/auth/toplevel?shop=${req.query.shop}`);
      return;
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      req.query.shop,
      "/auth/callback",
      USE_ONLINE_TOKENS
    );

    res.redirect(redirectUrl);
  });

  app.get("/auth/callback", async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query
      );

      const host = req.query.host;
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
      res.redirect(`/?shop=${session.shop}&host=${host}`);
    } catch (e) {
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          res.redirect(`/auth?shop=${req.query.shop}`);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });

  app.post("/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  app.post(
    "/graphql",
    verifyRequest({ isOnline: USE_ONLINE_TOKENS, returnHeader: true }),
    async (req, res, next) => {
      await Shopify.Utils.graphqlProxy(req, res);
    }
  );

  if (!__DEV__) {
    app.use("/static", express.static(path.join(__dirname, "../dist")));
  }
  app.get("*/", async (req, res) => {
    const shop = req.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      res.redirect(`/auth?shop=${shop}`);
    } else {
      res.set("Content-Type", "text/html");
      if (__DEV__) {
        res.sendFile(path.resolve(webpackConfig.output.path, "index.html"));
      } else {
        res.sendFile(__dirname, "../dist/client/index.js");
      }
    }
  });

  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}

createAppServer();
