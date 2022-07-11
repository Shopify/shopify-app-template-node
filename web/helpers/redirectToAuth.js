import { Shopify } from "@shopify/shopify-api";

export default async function redirectToAuth(req, res, app) {
  if (!req.query.shop) {
    res.status(500);
    return res.send("No shop provided");
  }

  res.cookie(app.get("top-level-oauth-cookie"), "1", {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
  });

  const redirectUrl = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop,
    "/api/auth/callback",
    app.get("use-online-tokens")
  );

  res.redirect(redirectUrl);
}
