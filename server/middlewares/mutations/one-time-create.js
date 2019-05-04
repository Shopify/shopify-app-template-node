import gql from 'graphql-tag';

export function ONETIME_CREATE(number, test) {
  console.log(number);
  return gql`
    mutation {
      appPurchaseOneTimeCreate(
        name: "Super Duper Expensive action"
        price: { amount: ${Number(number)}, currencyCode: USD }
        returnUrl: "https://c7d85795.ngrok.io"
        test: ${test}
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appPurchase {
          id
        }
      }
    }
  `;
}
