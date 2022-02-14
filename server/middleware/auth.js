const {default: Shopify} = require('@shopify/shopify-api');

const renderView = require('../helpers/render-view');
const verifyRequest = require('./verify-request');

module.exports = function applyAuthMiddlewares(app) {
  app.get('/auth', async (req, res) => {
    if (!req.signedCookies[app.get('top-level-oauth-cookie')]) {
      return res.redirect(`/auth/toplevel?shop=${req.query.shop}`);
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      req.query.shop,
      '/auth/callback',
      app.get('use-online-tokens'),
    );

    console.log({redirectUrl});

    res.redirect(redirectUrl);
  });

  app.get('/auth/toplevel', async (req, res) => {
    res.cookie(app.get('top-level-oauth-cookie'), '1', {
      signed: true,
      httpOnly: true,
      sameSite: 'strict',
    });

    res.set('Content-Type', 'text/html');

    console.log(
      renderView('top-level', {
        apiKey: Shopify.Context.API_KEY,
        hostName: Shopify.Context.HOST_NAME,
        shop: req.query.shop,
      }),
    );

    res.send(
      renderView('top-level', {
        apiKey: Shopify.Context.API_KEY,
        hostName: Shopify.Context.HOST_NAME,
        shop: req.query.shop,
      }),
    );
  });

  app.get('/auth/callback', async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query,
      );

      const host = req.query.host;
      app.set(
        'active-shopify-shops',
        Object.assign(app.get('active-shopify-shops'), {
          [session.shop]: session.scope,
        }),
      );

      const response = await Shopify.Webhooks.Registry.register({
        shop: session.shop,
        accessToken: session.accessToken,
        topic: 'APP_UNINSTALLED',
        path: '/webhooks',
      });

      if (!response['APP_UNINSTALLED'].success) {
        console.log(
          `Failed to register APP_UNINSTALLED webhook: ${response.result}`,
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

  app.post(
    '/graphql',
    verifyRequest({isOnline: app.get('use-online-tokens'), returnHeader: true}),
  );
};
