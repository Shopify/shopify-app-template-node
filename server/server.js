import "isomorphic-fetch";
import dotenv from "dotenv";
import "@babel/polyfill";
import Koa from "koa";
import Router from "koa-router";
import next from "next";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import session from "koa-session";
import * as handlers from "./handlers/index";
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ["read_products"],

      async afterAuth(ctx) {
        //Auth token and shop available in sesssion
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        ctx.redirect("/");
      }
    })
  );
  router.get("*", verifyRequest(), async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
