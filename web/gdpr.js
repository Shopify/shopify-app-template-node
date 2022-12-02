import { DeliveryMethod } from "@shopify/shopify-api";
import shopify from "./shopify.js";

export async function setupGDPRWebHooks(path) {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  await shopify.webhooks.addHandlers({
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        // Payload has the following shape:
        // {
        //   "shop_id": 954889,
        //   "shop_domain": "{shop}.myshopify.com",
        //   "orders_requested": [
        //     299938,
        //     280263,
        //     220458
        //   ],
        //   "customer": {
        //     "id": 191167,
        //     "email": "john@example.com",
        //     "phone": "555-625-1199"
        //   },
        //   "data_request": {
        //     "id": 9999
        //   }
        // }
      },
    },
  });

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  await shopify.webhooks.addHandlers({
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        // Payload has the following shape:
        // {
        //   "shop_id": 954889,
        //   "shop_domain": "{shop}.myshopify.com",
        //   "customer": {
        //     "id": 191167,
        //     "email": "john@example.com",
        //     "phone": "555-625-1199"
        //   },
        //   "orders_to_redact": [
        //     299938,
        //     280263,
        //     220458
        //   ]
        // }
      },
    },
  });

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  await shopify.webhooks.addHandlers({
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: path,
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        // Payload has the following shape:
        // {
        //   "shop_id": 954889,
        //   "shop_domain": "{shop}.myshopify.com"
        // }
      },
    },
  });
}
