import 'isomorphic-fetch';
import { gql } from 'apollo-boost';

const ONETIME_CREATE = gql`
    mutation {
      appPurchaseOneTimeCreate(
        name: "Super Duper Expensive action"
        price: { amount: 10, currencyCode: USD }
        returnUrl: tunnel url from env
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

export const getOneTimeUrl = async (ctx) => {
  const { client } = ctx
  const confirmationUrl = await client.mutate({
    mutation: ONETIME_CREATE,
  }).then((response) => (response.data.appPurchaseOneTimeCreate.confirmationUrl))
  //need to fix get correct reponse
  return ctx.redirect(confirmationUrl)
}
