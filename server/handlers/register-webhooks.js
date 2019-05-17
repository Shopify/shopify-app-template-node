import { registerWebhook } from "@shopify/koa-shopify-webhooks";

export const registerWebhooks = async (shop, accessToken, type, url) => {
  const registration = await registerWebhook({
    address: `${process.env.TUNNEL_URL}${url}`,
    topic: type,
    accessToken,
    shop
  });

  if (registration.success) {
    console.log("Successfully registered webhook!");
  } else {
    console.log(
      "Failed to register webhook",
      registration.result.data.webhookSubscriptionCreate
    );
  }
};
