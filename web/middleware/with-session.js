import { Shopify } from "@shopify/shopify-api";

export default async function withSession(req, res, next){
  const session = await Shopify.Utils.loadCurrentSession(
    req,
    res
  );

  if(!res.locals.shopify){
    res.locals.shopify = {}
  }

  res.locals.shopify.session = session

  next()
}