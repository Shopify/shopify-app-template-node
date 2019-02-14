import 'isomorphic-fetch';
import Koa from 'koa';
import next from 'next';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session';
import createShopifyAuth from '@shopify/koa-shopify-auth';
import { verifyRequest } from '@shopify/koa-shopify-auth';
import graphQLProxy from '@shopify/koa-shopify-graphql-proxy';
import {
  PORT,
  DEV,
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  SHOPIFY_DOMAIN,
  HOST,
} from '../config';
import {processPayment} from './router';
import validateWebhook from './webhooks';

const app = next({ dev: DEV });
const handle = app.getRequestHandler();


app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  router.post('/webhooks/products/create', validateWebhook);

  router.get('/', processPayment);

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      myShopifyDomain: SHOPIFY_DOMAIN,
      scopes: ['read_products', 'write_products'],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        console.log('We did it!', shop, accessToken);

        const tunnelUrl = HOST;

        const stringifiedBillingParams = JSON.stringify({
          recurring_application_charge: {
            name: 'Recurring charge',
            price: 20.01,
            return_url: tunnelUrl,
            test: true
          }
        })

        const stringifiedWebhookParams = JSON.stringify({
          webhook: {
            topic: 'products/create',
            address: `${tunnelUrl}/webhooks/products/create`,
            format: 'json',
          },
        });

        const webhookOptions = {
          method: 'POST',
          body: stringifiedWebhookParams,
          credentials: 'include',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        };
        await fetch(`https://${shop}/admin/webhooks.json`, webhookOptions)
          .then((response) => response.json())
          .then((jsonData) =>
            console.log('webhook response', JSON.stringify(jsonData)),
          )
          .catch((error) => console.log('webhook error', error));

        const options = {
          method: 'POST',
          body: stringifiedBillingParams,
          credentials: 'include',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        };

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
  server.use(bodyParser());
  server.use(router.routes());
  server.use(verifyRequest({authRoute: '/auth'}));
  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return;
  });

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
