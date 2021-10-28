import Shopify from "@shopify/shopify-api";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export default function verifyRequest({ isOnline, returnHeader }) {
  return async (ctx, next) => {
    const session = await Shopify.Utils.loadCurrentSession(
      ctx.req,
      ctx.res,
      isOnline
    );

    let shop = ctx.query.shop;

    if (session && shop && session.shop !== shop) {
      // The current request is for a different shop. Redirect immediately
      ctx.redirect(`/auth?shop=${shop}`);
    }

    if (session?.isActive()) {
      try {
        // make a request to make sure oauth has succeeded, retry otherwise
        const client = new Shopify.Clients.Graphql(
          session.shop,
          session.accessToken
        );
        await client.query({ data: TEST_GRAPHQL_QUERY });

        await next();
        return;
      } catch (e) {
        if (e instanceof HttpResponseError && e.code == 401) {
          // We only want to catch 401s here, anything else should bubble up
        } else {
          throw e;
        }
      }
    }

    if (returnHeader) {
      if (!shop) {
        if (session) {
          shop = session.shop;
        } else if (Shopify.Context.IS_EMBEDDED_APP) {
          const authHeader = ctx.req.headers.authorization;
          const matches = authHeader?.match(/Bearer (.*)/);
          if (matches) {
            const payload = Shopify.Utils.decodeSessionToken(matches[1]);
            shop = payload.dest.replace("https://", "");
          }
        }
      }

      ctx.res.statusCode = 403;
      ctx.res.setHeader("X-Shopify-API-Request-Failure-Reauthorize", "1");
      ctx.res.setHeader(
        "X-Shopify-API-Request-Failure-Reauthorize-Url",
        `/auth?shop=${shop}`
      );
    } else {
      ctx.redirect(`/auth?shop=${shop}`);
    }
  };
}
