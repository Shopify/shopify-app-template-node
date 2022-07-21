import { Shopify } from "@shopify/shopify-api";
import topLevelAuthRedirect from "./top-level-auth-redirect.js";

export default async function beginAuth(req, res, app) {
  if (!req.query.shop) {
    res.status(500);
    return res.send("No shop provided");
  }

  if (!req.signedCookies[app.get("top-level-oauth-cookie")]) {
    return topLevelAuthRedirect(req, res, app);
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
