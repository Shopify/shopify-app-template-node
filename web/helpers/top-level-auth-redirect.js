export default function topLevelAuthRedirect({ apiKey, hostName, shop }) {
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
</html>`;
}
