import 'isomorphic-fetch';
import { gql } from 'apollo-boost';

export const RECURRING_CREATE = gql`
  mutation {
    appSubscriptionCreate(
        name: "Super Duper Plan"
        returnUrl: tunnel url from env
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
  }`;

export const getSubscriptionUrl = async (ctx) => {
  const { client } = ctx
  const confirmationUrl = await client.mutate({
    mutation: RECURRING_CREATE,
  }).then((response) => (response.data.appSubscriptionCreate.confirmationUrl))

  return ctx.redirect(confirmationUrl)
}
