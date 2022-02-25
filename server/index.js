// @ts-check
import {resolve} from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';
import {Shopify, ApiVersion} from '@shopify/shopify-api';
import 'dotenv/config';

import applyAuthMiddleware from './middleware/auth.js';

const USE_ONLINE_TOKENS = true;
const PORT = parseInt(process.env.PORT || '8081', 10);
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(','),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ''),
  API_VERSION: ApiVersion.Unstable,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
Shopify.Webhooks.Registry.addHandler('APP_UNINSTALLED', {
  path: '/webhooks',
  webhookHandler: async (topic, shop, body) =>
    delete ACTIVE_SHOPIFY_SHOPS[shop],
});

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production',
) {
  const app = express();
  app.set('top-level-oauth-cookie', 'shopify_top_level_oauth');
  app.set('active-shopify-shops', ACTIVE_SHOPIFY_SHOPS);
  app.set('use-online-tokens', USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);

  app.post('/webhooks', async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  app.post('/graphql', async (req, res) => {
    await Shopify.Utils.graphqlProxy(req, res);
  });

  app.use((req, res, next) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        'Content-Security-Policy',
        `frame-ancestors https://${shop} https://admin.shopify.com;`,
      );
    } else {
      res.setHeader('Content-Security-Policy', `frame-ancestors 'none';`);
    }
    next();
  });

  app.use('/*', (req, res, next) => {
    const shop = req.query.shop;

    // Detect whether we need to reinstall the app, any request from Shopify will
    // include a shop in the query parameters.
    if (app.get('active-shopify-shops')[shop] === undefined && shop) {
      res.redirect(`/auth?shop=${shop}`);
    } else {
      next();
    }
  });

  let vite;
  if (!isProd) {
    vite = await import('vite');
    vite = await vite.createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        port: PORT,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: 64999,
          clientPort: 64999,
        },
        middlewareMode: 'html',
      },
    });
    app.use(vite.middlewares);
  } else {
    app.use(require('compression')());
    app.use(require('serve-static')(resolve('dist/client')));
  }

  return {app, vite};
}

if (!isTest) {
  createServer().then(({app}) => app.listen(PORT));
}
