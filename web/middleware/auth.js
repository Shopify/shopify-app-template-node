import {
  gdprTopics,
  InvalidOAuthError,
  CookieNotFound,
} from "@shopify/shopify-api";

import shopify from "../shopify.js";
import { sqliteSessionStorage } from "../sqlite-session-storage.js";
import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";

export default function applyAuthMiddleware(router) {
  router.get("/api/auth", async (ctx, _next) => {
    console.log("DEBUG: /api/auth, ctx.request.url: ", ctx.request.url);
    return redirectToAuth(ctx);
  });

  router.get("/api/auth/callback", async (ctx, _next) => {
    console.log(
      "DEBUG: /api/auth/callback, ctx.request.url: ",
      ctx.request.url
    );
    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: ctx.req,
        rawResponse: ctx.res,
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
        return ctx.redirect(confirmationUrl);
      }

      const host = shopify.utils.sanitizeHost(ctx.request.query.host);
      const embeddedUrl =
        "https://admin.shopify.com/store/the-dog-hates-me-too/apps/35b348fd8ac75d025cceee9555fe4ef3";
      const redirectUrl = shopify.config.isEmbeddedApp
        ? embeddedUrl
        : // ? await shopify.auth.getEmbeddedAppUrl({
          //     rawRequest: ctx.req,
          //     rawResponse: ctx.res,
          //   })
          `/?shop=${callbackResponse.session.shop}&host=${encodeURIComponent(
            host
          )}`;

      ctx.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof InvalidOAuthError:
          ctx.status = 400;
          ctx.body = e.message;
          break;
        case e instanceof CookieNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          return redirectToAuth(ctx);
          break;
        default:
          ctx.status = 500;
          ctx.body = e.message;
          break;
      }
    }
  });
}
