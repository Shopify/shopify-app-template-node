import {
  CookieNotFound,
  gdprTopics,
  InvalidOAuthError,
  SessionNotFound
} from "@shopify/shopify-api";

import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";

export default function applyAuthMiddleware(shopify, app) {
  app.get("/api/auth", async (req, res) => {
    return redirectToAuth(req, res, shopify, app)
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
        isOnline: app.get("use-online-tokens"),
      });

      const responses = await shopify.webhooks.registerAll({
        shop: callbackResponse.session.shop,
        accessToken: callbackResponse.session.accessToken,
      });

      Object.entries(responses).map(([topic, response]) => {
        // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
        if (!response.success && !gdprTopics.includes(topic)) {
          if (response.result.errors) {
            console.log(
              `Failed to register ${topic} webhook: ${response.result.errors[0].message}`
            );
          } else {
            console.log(
              `Failed to register ${topic} webhook: ${
                JSON.stringify(response.result.data, undefined, 2)
              }`
            );
          }
        }
      });

      // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
      const [hasPayment, confirmationUrl] = await ensureBilling(callbackResponse.session, shopify);
      if (!hasPayment) {
        return res.redirect(confirmationUrl);
      }

      const host = shopify.utils.sanitizeHost(req.query.host);
      const redirectUrl = shopify.config.isEmbeddedApp
        ? shopify.auth.getEmbeddedAppUrl(req)
        : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;

      res.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof CookieNotFound:
        case e instanceof SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          return redirectToAuth(req, res, shopify, app);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });
}
