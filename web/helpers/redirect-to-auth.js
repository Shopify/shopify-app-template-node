import { Shopify } from "@shopify/shopify-api";

export default async function redirectToAuth(req, res, app) {
  if (!req.query.shop) {
    res.status(500);
    return res.send("No shop provided");
  }

  const redirectUrl = await Shopify.Auth.beginAuth(
    req,
    res,
    req.query.shop,
    "/api/auth/callback",
    app.get("use-online-tokens")
  );

  res.redirect(redirectUrl);
}
