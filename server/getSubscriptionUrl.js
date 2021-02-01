const { default: Shopify } = require('@shopify/shopify-api');

const getSubscriptionUrl = async (accessToken, shop, returnUrl) => {
  const query = `mutation {
    appSubscriptionCreate(
      name: "Super Duper Plan"
      returnUrl: "${returnUrl}"
      test: true
      lineItems: [
        {
          plan: {
            appUsagePricingDetails: {
              cappedAmount: { amount: 10, currencyCode: USD }
              terms: "$1 for 1000 emails"
            }
          }
        }
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: 10, currencyCode: USD }
            }
          }
        }
      ]
    )
    {
      userErrors {
        field
        message
      }
      confirmationUrl
      appSubscription {
        id
      }
    }
  }`;

  const client = new Shopify.Clients.Graphql(shop, accessToken);
  const response = await client.query({
    data: query,
  });

  return response.body.data.appSubscriptionCreate.confirmationUrl;
};

module.exports = getSubscriptionUrl;
