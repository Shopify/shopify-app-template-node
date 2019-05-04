import { gql } from 'apollo-boost';

export const RECURRING_CREATE = gql`
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
  }`;
