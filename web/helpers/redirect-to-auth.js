import shopify, { USE_ONLINE_TOKENS } from "../shopify.js";

export default async function redirectToAuth(ctx) {
  if (!ctx.request.query.shop) {
    ctx.status = 500;
    ctx.body = "No shop provided";
    return;
  }

  if (ctx.request.query.embedded === "1") {
    return clientSideRedirect(ctx);
  }

  return await serverSideRedirect(ctx);
}

function clientSideRedirect(ctx) {
  const shop = shopify.utils.sanitizeShop(ctx.request.query.shop);
  const redirectUriParams = new URLSearchParams({
    shop,
    host: ctx.request.query.host,
  }).toString();
  const queryParams = new URLSearchParams({
    ...ctx.request.query,
    shop,
    redirectUri: `https://${shopify.config.hostName}/api/auth?${redirectUriParams}`,
  }).toString();

  return ctx.redirect(`/exitiframe?${queryParams}`);
}

async function serverSideRedirect(ctx) {
  // ctx.respond = false;
  await shopify.auth.begin({
    rawRequest: ctx.req,
    rawResponse: ctx.res,
    shop: ctx.request.query.shop,
    callbackPath: "/api/auth/callback",
    isOnline: USE_ONLINE_TOKENS,
  });
}
