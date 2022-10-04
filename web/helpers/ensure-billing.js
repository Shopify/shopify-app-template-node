import shopify from "../shopify.js";

/**
 * You may want to charge merchants for using your app. This helper provides that function by checking if the current
 * merchant has an active one-time payment or subscription named `chargeName`. If no payment is found,
 * this helper requests it and returns a confirmation URL so that the merchant can approve the purchase.
 *
 * Learn more about billing in our documentation: https://shopify.dev/apps/billing
 */
export default async function ensureBilling(
  session,
  isProdOverride = process.env.NODE_ENV === "production"
) {
  let hasPayment = true;
  let confirmationUrl = null;

  if (shopify.config.billing) {
    hasPayment = await shopify.billing.check({
      session,
      plans: Object.keys(shopify.config.billing),
      isTest: !isProdOverride,
    });

    if (!hasPayment) {
      // realistically, if there are more than one plan to choose from, you should redirect to
      // a page that allows the merchant to choose a plan
      // for this example, we'll just redirect to the first plan
      confirmationUrl = await shopify.billing.request({
        session: callback.session,
        plan: Object.keys(shopify.config.billing)[0],
        isTest: !isProdOverride,
      });
    }
  }

  return [hasPayment, confirmationUrl];
}
