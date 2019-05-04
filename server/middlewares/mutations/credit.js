import gql from 'graphql-tag';

export function CREDITS_CREATE(number, test) {
  console.log(number);
  return gql`
    mutation {
      appCreditCreate(
        description: "Credits for emails"
        amount: { currencyCode: USD, amount: ${Number(number)} }
        test: ${test}
      ) {
        appCredit {
          id
        }
        userErrors {
          message
        }
      }
    }
  `;
}
