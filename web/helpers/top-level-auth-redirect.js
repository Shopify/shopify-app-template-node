import { Shopify } from "@shopify/shopify-api";

export default function topLevelAuthRedirect(req, res, app) {
  res.cookie(app.get("top-level-oauth-cookie"), "1", {
    signed: true,
    httpOnly: true,
    sameSite: "strict",
  });

  res.set("Content-Type", "text/html");

  res.send(
    redirectHTML({
      apiKey: Shopify.Context.API_KEY,
      hostName: Shopify.Context.HOST_NAME,
      shop: req.query.shop,
    })
  );
}

function redirectHTML({ apiKey, hostName, shop }) {
  return `<!DOCTYPE html>
    <html>
      <head>
        <script src="https://unpkg.com/@shopify/app-bridge@3.1.0"></script>
        <script src="https://unpkg.com/@shopify/app-bridge-utils@3.1.0"></script>

        <script>
          document.addEventListener('DOMContentLoaded', function () {
            var appBridgeUtils = window['app-bridge-utils'];

            if (appBridgeUtils.isShopifyEmbedded()) {
              var AppBridge = window['app-bridge'];
              var createApp = AppBridge.default;
              var Redirect = AppBridge.actions.Redirect;

              const app = createApp({
                apiKey: '${apiKey}',
                shopOrigin: '${shop}',
              });

              const redirect = Redirect.create(app);

              redirect.dispatch(
                Redirect.Action.REMOTE,
                'https://${hostName}/api/auth/toplevel?shop=${shop}',
              );
            } else {
              window.location.href = '/api/auth?shop=${shop}';
            }
          });
        </script>
      </head>
      <body></body>
    </html>
  `;
}
