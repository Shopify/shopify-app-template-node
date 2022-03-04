import {Shopify} from '@shopify/shopify-api';

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export default function verifyRequest({isOnline, returnHeader}) {
  return async (req, res, next) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, isOnline);

    let shop = req.query.shop;

    if (session && shop && session.shop !== shop) {
      // The current request is for a different shop. Redirect gracefully.
      res.redirect(`/auth?shop=${shop}`);
    }

    if (session?.isActive()) {
      try {
        // make a request to make sure oauth has succeeded, retry otherwise
        const client = new Shopify.Clients.Graphql(
          session.shop,
          session.accessToken,
        );
        await client.query({data: TEST_GRAPHQL_QUERY});
        return next();
      } catch (e) {
        if (e instanceof Shopify.Errors.HttpResponseError && e.code === 401) {
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
          const authHeader = req.headers.authorization;
          const matches = authHeader?.match(/Bearer (.*)/);
          if (matches) {
            const payload = Shopify.Utils.decodeSessionToken(matches[1]);
            shop = payload.dest.replace('https://', '');
          }
        }
      }

      if (!shop || shop === '') {
        return res
          .status(400)
          .send(
            `Could not find a shop to authenticate with. Make sure you are making your XHR request with App Bridge's authenticatedFetch method.`,
          );
      }

      res.status(403);
      res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
      res.header(
        'X-Shopify-API-Request-Failure-Reauthorize-Url',
        `/auth?shop=${shop}`,
      );
      res.end();
    } else {
      res.redirect(`/auth?shop=${shop}`);
    }
  };
}
