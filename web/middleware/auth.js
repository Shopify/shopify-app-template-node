import {
  gdprTopics,
  InvalidOAuthError,
  CookieNotFound,
} from "@shopify/shopify-api";

import shopify, { USE_ONLINE_TOKENS } from "../shopify.js";
import { sqliteSessionStorage } from "../sqlite-session-storage.js";
import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";

export default async function applyAuthMiddleware(fastify, _options) {
  fastify.get("/api/auth", async (request, reply) => {
    await redirectToAuth(request, reply);
  });

  fastify.get("/api/auth/callback", async (request, reply) => {
    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: request.raw,
        rawResponse: reply.raw,
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
        reply.redirect(confirmationUrl);
        return;
      }

      const host = shopify.utils.sanitizeHost(request.query.host);
      const redirectUrl = shopify.config.isEmbeddedApp
        ? await shopify.auth.getEmbeddedAppUrl({
            rawRequest: request.raw,
            rawResponse: reply.raw,
          })
        : `/?shop=${callbackResponse.session.shop}&host=${encodeURIComponent(
            host
          )}`;

      reply.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof InvalidOAuthError:
          reply.code(400).send(e.message);
          break;
        case e instanceof CookieNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          console.log("DEBUG: CookieNotFound, redirecting to auth");
          await redirectToAuth(request, reply);
          break;
        default:
          reply.code(500).send(e.message);
          break;
      }
    }
  });
}
