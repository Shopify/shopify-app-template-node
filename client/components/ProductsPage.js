import { gql, useQuery } from "@apollo/client";
import { Banner, Layout, Card } from "@shopify/polaris";
import React from "react";
import { ProductsList } from "./ProductsList";
import { Loading } from "@shopify/app-bridge-react";

// GraphQL query to retrieve products by IDs.
// The price field belongs to the variants object because
// variations of a product can have different prices.
const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

function ProductsPage({ productIds }) {
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_ID, {
    variables: { ids: productIds },
  });
  if (loading) return <Loading />;

  if (error) {
    console.warn(error);
    return (
      <Banner status="critical">There was an issue loading products.</Banner>
    );
  }

  return (
    <Layout.Section>
      <Card>
        <ProductsList data={data} />
      </Card>
    </Layout.Section>
  );
}

export default ProductsPage;
