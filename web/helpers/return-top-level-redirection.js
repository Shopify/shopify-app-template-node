export default function returnTopLevelRedirection(request, reply, redirectUrl) {
  const bearerPresent = request.headers.authorization?.match(/Bearer (.*)/);

  // If the request has a bearer token, the app is currently embedded, and must break out of the iframe to
  // re-authenticate
  if (bearerPresent) {
    reply
      .status(403)
      .header("X-Shopify-API-Request-Failure-Reauthorize", "1")
      .header("X-Shopify-API-Request-Failure-Reauthorize-Url", redirectUrl)
      .end();
  } else {
    reply.redirect(redirectUrl);
  }
}
