import { gql } from 'apollo-boost';

export const ONETIME_CREATE = gql`
    mutation {
      appPurchaseOneTimeCreate(
        name: "Super Duper Expensive action"
        price: { amount: 10, currencyCode: USD }
        returnUrl: "https://15a2f115.ngrok.io"
        test: true
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
      }
    }
  `;
