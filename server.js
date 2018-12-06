import 'isomorphic-fetch';
import Koa from 'koa';
import next from 'next';
import Router from 'koa-router';
import {readFileSync} from 'fs-extra';
import createShopifyAuth from '@shopify/koa-shopify-auth';
import dotenv from 'dotenv';
import { verifyRequest } from '@shopify/koa-shopify-auth';
import session from 'koa-session';
import graphQLProxy from '@shopify/koa-shopify-graphql-proxy';
import {port, dev, tunnelFile} from './config/server';
import {processPayment} from './server/router';

const app = next({ dev });
const handle = app.getRequestHandler();

dotenv.config();
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  router.get('/', processPayment);

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
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        const stringifiedBillingParams = JSON.stringify({
          recurring_application_charge: {
            name: 'Recurring charge',
            price: 20.01,
            return_url: readFileSync(tunnelFile).toString(),
            test: true
          }
        })
        const options = {
          method: 'POST',
          body: stringifiedBillingParams,
          credentials: 'include',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        };

        console.log('We did it!', shop, accessToken);

        const confirmationURL = await fetch(
          `https://${shop}/admin/recurring_application_charges.json`, options)
          .then((response) => response.json())
          .then((jsonData) => jsonData.recurring_application_charge.confirmation_url)
          .catch((error) => console.log('error', error));

        await ctx.redirect(confirmationURL);
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
