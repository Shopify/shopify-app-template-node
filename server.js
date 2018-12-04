import 'isomorphic-fetch';
import Koa from 'koa';
import next from 'next';
import Router from 'koa-router';
import createShopifyAuth from '@shopify/koa-shopify-auth';
import dotenv from 'dotenv';
import { verifyRequest } from '@shopify/koa-shopify-auth';
import session from 'koa-session';
import graphQLProxy from '@shopify/koa-shopify-graphql-proxy';
import {port, dev} from './config/server';

const app = next({ dev });
const handle = app.getRequestHandler();

dotenv.config();
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  router.get('*', async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  });

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products', 'write_products'],
      afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        console.log('We did it!', shop, accessToken);

        ctx.redirect('/');
      },
    }),
  );
  server.use(graphQLProxy());
  server.use(router.routes());
  server.use(verifyRequest({authRoute: '/auth'}));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
