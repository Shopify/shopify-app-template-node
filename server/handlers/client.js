import ApolloClient from "apollo-boost";

export const createClient = (shop, accessToken) => {
  return new ApolloClient({
    uri: `https://${shop}/admin/api/unstable/graphql.json`,
    request: operation => {
      operation.setContext({
        headers: {
          "X-Shopify-Access-Token": accessToken
        }
      });
    }
  });
};
