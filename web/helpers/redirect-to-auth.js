import shopify, { USE_ONLINE_TOKENS } from "../shopify.js";

export default async function redirectToAuth(request, reply) {
  if (!request.query.shop) {
    return reply.code(500).send("No shop provided");
  }

  if (request.query.embedded === "1") {
    return clientSideRedirect(request, reply);
  }

  return await serverSideRedirect(request, reply);
}

function clientSideRedirect(request, reply) {
  const shop = shopify.utils.sanitizeShop(request.query.shop);
  const redirectUriParams = new URLSearchParams({
    shop,
    host: request.query.host,
  }).toString();
  const queryParams = new URLSearchParams({
    ...request.query,
    shop,
    redirectUri: `https://${shopify.config.hostName}/api/auth?${redirectUriParams}`,
  }).toString();

  return reply.redirect(`/exitiframe?${queryParams}`);
}

async function serverSideRedirect(request, reply) {
  await shopify.auth.begin({
    rawRequest: request.raw,
    rawResponse: reply.raw,
    shop: request.query.shop,
    callbackPath: "/api/auth/callback",
    isOnline: USE_ONLINE_TOKENS,
  });
}
