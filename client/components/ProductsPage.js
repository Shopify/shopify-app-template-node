import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Banner, Layout, Card } from "@shopify/polaris";
import { ProductsList } from "./ProductsList";
import { Loading } from "@shopify/app-bridge-react";

const PRODUCTS_QUERY = gql`
  {
    products(first: 10) {
      edges {
        cursor
        node {
          id
          title
          onlineStoreUrl
        }
      }
    }
  }
`;

function ProductsPage() {
  const { loading, error, data } = useQuery(PRODUCTS_QUERY);

  if (loading) return <Loading />;

  if (error)
    return (
      <Banner status="critical">There was an issue loading products.</Banner>
    );

  const products = data.products.edges.map((edge) => {
    return {
      id: edge.node.id,
      title: edge.node.title,
    };
  });

  return (
    <Layout.Section>
      <Card>
        <ProductsList data={products} />
      </Card>
    </Layout.Section>
  );
}

export default ProductsPage;
