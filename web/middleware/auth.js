import { Shopify } from "@shopify/shopify-api";
import { gdprTopics } from "@shopify/shopify-api/dist/webhooks/registry.js";

import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirectToAuth.js";

export default function applyAuthMiddleware(
  app,
  { billing = { required: false } } = { billing: { required: false } }
) {
  // TODO: Not sure if we still need this?
  // Instead of redirecting to this route, we call this code directly.
  // We only need this is something else calls this route
  app.get("/api/auth", async (req, res) => {
    redirectToAuth(req, res, app);
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query
      );

      const host = req.query.host;

      const responses = await Shopify.Webhooks.Registry.registerAll({
        shop: session.shop,
        accessToken: session.accessToken,
      });

      Object.entries(responses).map(([topic, response]) => {
        // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
        if (!response.success && !gdprTopics.includes(topic)) {
          console.log(
            `Failed to register ${topic} webhook: ${response.result.errors[0].message}`
          );
        }
      });

      // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
      // TODO: Assume we do soemthing like this:
      // const adminPath = await Shopify.Auth.getAdminPath(host);
      // That way we control constucting the URL correctly
      // This requires updating @shopify/shopify-api & equivelant libraries.
      const adminPath = Buffer.from(host, "base64").toString();
      let redirectUrl = `https://${adminPath}/apps/${Shopify.Context.API_KEY}`;

      if (billing.required) {
        const [hasPayment, confirmationUrl] = await ensureBilling(
          session,
          billing
        );

        if (!hasPayment) {
          redirectUrl = confirmationUrl;
        }
      }

      // Redirect to app with shop parameter upon auth
      res.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          redirectToAuth(req, res, app);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });
}
