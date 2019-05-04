require('isomorphic-fetch');
import { recurringBilling } from './mutations/recurring-billing-mutation';
import { credit } from './mutations/credit';
import { oneTimeCreate } from './mutations/one-time-create';

export const callBilling = (ctx, query) => {
  const { shop, accessToken } = ctx.session;

  const option = new Map()
    .set('recurring', recurringBilling)
    .set('credit', credit)
    .set('onetime', oneTimeCreate);

  function test(type) {
    return option.get(type) || [];
  }

  const endpoint = `https://${shop}/admin/api/unstable/graphql.json`
  const options = {
    method: "POST",
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
      'Accept': '*/*',
    },
    body: JSON.stringify({ query: test(query) })
  }

  return fetch(endpoint, options)
    .then(res => res.json())
    .then((jsonData) => (jsonData.data.appSubscriptionCreate.confirmationUrl))
    .catch(console.error);
}
