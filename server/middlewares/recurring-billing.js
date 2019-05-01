require('isomorphic-fetch');

export const confirmationUrl = (shop, accessToken) => {

  const mutation = `
         mutation {
           appSubscriptionCreate(
               name: "Super Duper Plan"
               returnUrl: "https://15a2f115.ngrok.io"
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
             ) {
                 userErrors {
                   field
                   message
                 }
                 confirmationUrl
                 appSubscription {
                   id
                 }
             }
         }
         `


  const endpoint = `https://${shop}/admin/api/unstable/graphql.json`
  const options = {
    method: "POST",
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
      'Accept': '*/*',
    },
    body: JSON.stringify({ query: mutation })
  }


  return fetch(endpoint, options)
    .then(res => res.json())
    .then((jsonData) => (jsonData.data.appSubscriptionCreate.confirmationUrl))
    .catch(console.error);
}
