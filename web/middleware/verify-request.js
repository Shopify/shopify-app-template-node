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

export default async function verifyRequest(request, reply) {
  console.log(`DEBUG: verifyRequest, ${request.url}`);
  const sessionId = await shopify.session.getCurrentId({
    rawRequest: request.raw,
    rawResponse: reply.raw,
    isOnline: USE_ONLINE_TOKENS,
  });

  const session = await sqliteSessionStorage.loadSession(sessionId);

  let shop = shopify.utils.sanitizeShop(request.query.shop);

  if (session && shop && session.shop !== shop) {
    // The current request is for a different shop. Redirect gracefully.
    return redirectToAuth(request, reply);
  }

  if (session && session.isActive(shopify.config.scopes)) {
    try {
      const [hasPayment, confirmationUrl] = await ensureBilling(session);

      if (!hasPayment) {
        returnTopLevelRedirection(request, reply, confirmationUrl);
        return;
      } else {
        // Make a request to ensure the access token is still valid. Otherwise, re-authenticate the user.
        const client = new shopify.clients.Graphql({ session });
        await client.query({ data: TEST_GRAPHQL_QUERY });
      }
      return;
    } catch (e) {
      if (e instanceof HttpResponseError && e.response.code === 401) {
        // Re-authenticate if we get a 401 response
      } else if (e instanceof BillingError) {
        console.error(e.message, e.errorData[0]);
        reply.code(500).end();
        return;
      } else {
        throw e;
      }
    }
  }

  const bearerPresent = request.headers.authorization?.match(/Bearer (.*)/);
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
    request,
    reply,
    `/api/auth?shop=${encodeURIComponent(shop)}`
  );
}
