export default function returnTopLevelRedirection(ctx, redirectUrl) {
  const bearerPresent = ctx.request.headers.authorization?.match(/Bearer (.*)/);

  // If the request has a bearer token, the app is currently embedded, and must break out of the iframe to
  // re-authenticate
  if (bearerPresent) {
    ctx.status = 403;
    ctx.set("X-Shopify-API-Request-Failure-Reauthorize", "1");
    ctx.set("X-Shopify-API-Request-Failure-Reauthorize-Url", redirectUrl);
    ctx.body = null;
  } else {
    ctx.redirect(redirectUrl);
  }
}
