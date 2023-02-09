import { BillingError, HttpResponseError } from "@shopify/shopify-api";
import shopify, { USE_ONLINE_TOKENS } from "../shopify.js";
import { sqliteSessionStorage } from "../sqlite-session-storage.js";
import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";

import returnTopLevelRedirection from "../helpers/return-top-level-redirection.js";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export default function verifyRequest() {
  return async (ctx, next) => {
    console.log(
      `DEBUG: verifyRequest called, ctx.request.url: ${ctx.request.url}`
    );
    const sessionId = await shopify.session.getCurrentId({
      rawRequest: ctx.req,
      rawResponse: ctx.res,
      isOnline: USE_ONLINE_TOKENS,
    });

    const session = await sqliteSessionStorage.loadSession(sessionId);

    let shop = shopify.utils.sanitizeShop(ctx.request.query.shop);

    if (session && shop && session.shop !== shop) {
      // The current request is for a different shop. Redirect gracefully.
      return redirectToAuth(ctx);
    }

    if (session && session.isActive(shopify.config.scopes)) {
      try {
        const [hasPayment, confirmationUrl] = await ensureBilling(session);

        if (!hasPayment) {
          returnTopLevelRedirection(ctx, confirmationUrl);
          return;
        } else {
          // Make a request to ensure the access token is still valid. Otherwise, re-authenticate the user.
          const client = new shopify.clients.Graphql({ session });
          await client.query({ data: TEST_GRAPHQL_QUERY });
        }
        return await next();
      } catch (e) {
        if (e instanceof HttpResponseError && e.response.code === 401) {
          // Re-authenticate if we get a 401 response
        } else if (e instanceof BillingError) {
          console.error(e.message, e.errorData[0]);
          ctx.status = 500;
          ctx.body = null;
          return;
        } else {
          throw e;
        }
      }
    }

    const bearerPresent =
      ctx.request.headers.authorization?.match(/Bearer (.*)/);
    if (bearerPresent) {
      if (!shop) {
        if (session) {
          shop = session.shop;
        } else if (shopify.config.isEmbeddedApp) {
          if (bearerPresent) {
            const payload = await shopify.session.decodeSessionToken(
              bearerPresent[1]
            );
            shop = payload.dest.replace("https://", "");
          }
        }
      }
    }

    returnTopLevelRedirection(
      ctx,
      `/api/auth?shop=${encodeURIComponent(shop)}`
    );
  };
}
