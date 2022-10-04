import { BillingError, HttpResponseError } from "@shopify/shopify-api";

import shopify from "../shopify.js";
import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";

import returnTopLevelRedirection from "../helpers/return-top-level-redirection.js";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export default function verifyRequest(app) {
  return async (req, res, next) => {
    const session = await shopify.session.getCurrent({
      isOnline: app.get("use-online-tokens"),
      rawRequest: req,
      rawResponse: res,
    });

    let shop = shopify.utils.sanitizeShop(req.query.shop);
    if (session && shop && session.shop !== shop) {
      // The current request is for a different shop. Redirect gracefully.
      return redirectToAuth(req, res, app);
    }

    if (session?.isActive(shopify.config.scopes)) {
      try {
        const [hasPayment, confirmationUrl] = await ensureBilling(session);
        if (!hasPayment) {
          returnTopLevelRedirection(req, res, confirmationUrl);
          return;
        } else {
          // Make a request to ensure the access token is still valid. Otherwise, re-authenticate the user.
          const client = new shopify.clients.Graphql({
            domain: session.shop,
            accessToken: session.accessToken
          });
          await client.query({ data: TEST_GRAPHQL_QUERY });
        }
        return next();
      } catch (e) {
        if (
          e instanceof HttpResponseError &&
          e.response.code === 401
        ) {
          // Re-authenticate if we get a 401 response
        } else if (e instanceof BillingError) {
          console.error(e.message, e.errorData[0]);
          res.status(500).end();
          return;
        } else {
          throw e;
        }
      }
    }

    const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
    if (bearerPresent) {
      if (!shop) {
        if (session) {
          shop = session.shop;
        } else if (shopify.config.isEmbeddedApp) {
          if (bearerPresent) {
            const payload = await shopify.session.decodeSessionToken(bearerPresent[1]);
            shop = payload.dest.replace("https://", "");
          }
        }
      }
    }

    returnTopLevelRedirection(
      req,
      res,
      `/api/auth?shop=${encodeURIComponent(shop)}`
    );
  };
}
