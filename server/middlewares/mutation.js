import 'isomorphic-fetch';
import ApolloClient from 'apollo-boost';
import { RECURRING_CREATE } from './mutations/recurring-billing-mutation';
import { ONETIME_CREATE } from './mutations/one-time-create';

export const callBilling = async (ctx, query) => {
  const { shop, accessToken } = ctx.session;

  const client = new ApolloClient({
    uri: `https://${shop}/admin/api/unstable/graphql.json`,
    request: operation => {
      operation.setContext({
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });
    },
  });
  const option = new Map()
    .set('recurring', RECURRING_CREATE)
    .set('onetime', ONETIME_CREATE);

  const getType = (type) => option.get(type) || [];

  const confirmationUrl = await client.mutate({
    mutation: getType(query),
  }).then((response) => (response.data.appSubscriptionCreate.confirmationUrl))

  return ctx.redirect(confirmationUrl)
}
