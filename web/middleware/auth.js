import {
  gdprTopics,
  InvalidOAuthError,
  CookieNotFound,
} from "@shopify/shopify-api";

import shopify from "../shopify.js";
import { sqliteSessionStorage } from "../sqlite-session-storage.js";
import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";

export default function applyAuthMiddleware(app) {
  app.get("/api/auth", async (req, res) => {
    return redirectToAuth(req, res, app);
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
        isOnline: app.get("use-online-tokens"),
      });

      // save the session
      if (
        (await sqliteSessionStorage.storeSession(callbackResponse.session)) ==
        false
      ) {
        console.log(`Failed to store session ${callbackResponse.session.id}`);
      }

      const responses = await shopify.webhooks.register({
        session: callbackResponse.session,
      });

      Object.entries(responses).map(([topic, responsesForTopic]) => {
        // The response from register will include the GDPR topics - these can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.

        // If there are no entries in the response array, there was no change in webhook
        // registrations for that topic.
        if (!gdprTopics.includes(topic) && responsesForTopic.length > 0) {
          // Check the result of each response for errors
          responsesForTopic.map((response) => {
            if (!response.success) {
              if (response.result.errors) {
                console.log(
                  `Failed to register ${topic} webhook: ${response.result.errors[0].message}`
                );
              } else {
                console.log(
                  `Failed to register ${topic} webhook: ${JSON.stringify(
                    response.result.data,
                    undefined,
                    2
                  )}`
                );
              }
            }
          });
        }
      });

      const [hasPayment, confirmationUrl] = await ensureBilling(
        callbackResponse.session
      );

      if (!hasPayment) {
        return res.redirect(confirmationUrl);
      }

      const host = shopify.utils.sanitizeHost(req.query.host);
      const redirectUrl = shopify.config.isEmbeddedApp
        ? await shopify.auth.getEmbeddedAppUrl({
            rawRequest: req,
            rawResponse: res,
          })
        : `/?shop=${callbackResponse.session.shop}&host=${encodeURIComponent(
            host
          )}`;

      res.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof CookieNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          return redirectToAuth(req, res, app);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });
}
