import '@babel/polyfill'
require('isomorphic-fetch');
import Koa from 'koa';
import next from 'next';
import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth'
import dotenv from 'dotenv';
import session from 'koa-session';
import { GraphQLClient } from 'graphql-request'

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products'],
      afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        const endpoint = `https://${shop}/admin/api/unstable/graphql.json`
        const options = {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/graphql',
            'X-Shopify-Access-Token': accessToken,
            'Accept': '*/*',
          },
          body: JSON.stringify({ mutation })
        }
        const mutation = `
          mutation {
            appSubscriptionCreate(
                name: "Super Duper Plan"
                returnUrl: "https://15a2f115.ngrok.io"
                test: true
                lineItems: [
                {
                    plan: {
                      appUsagePricingDetails: {
                          cappedAmount: { amount: 10, currencyCode: USD }
                          terms: "$1 for 1000 emails"
                      }
                    }
                }
                {
                    plan: {
                      appRecurringPricingDetails: {
                          price: { amount: 10, currencyCode: USD }
                      }
                    }
                }
                ]
              ) {
                  userErrors {
                    field
                    message
                  }
                  confirmationUrl
                  appSubscription {
                    id
                  }
              }
          }
          `
        fetch(endpoint, options)
          .then(res => res.json())
          .then(console.log)
          .catch(console.error);
        ctx.redirect('/');
      },
    }),
  );

  server.use(verifyRequest());
  server.use(async (ctx) => {

    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
