export default function topLevelAuthRedirect({
  apiKey,
  hostName,
  host,
  query,
}) {
  const serializedQuery = new URLSearchParams(query).toString();
  return `<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/@shopify/app-bridge@2"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function () {
        if (window.top === window.self) {
          window.location.href = '/auth?${serializedQuery}';
        } else {
          var AppBridge = window['app-bridge'];
          var createApp = AppBridge.default;
          var Redirect = AppBridge.actions.Redirect;

          const app = createApp({
            apiKey: '${apiKey}',
            host: '${host}',
          });

          const redirect = Redirect.create(app);

          redirect.dispatch(
            Redirect.Action.REMOTE,
            'https://${hostName}/auth/toplevel?${serializedQuery}',
          );
        }
      });
    </script>
  </head>
  <body></body>
</html>`;
}
