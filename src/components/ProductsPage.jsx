import {gql, useQuery} from '@apollo/client';
import {Loading} from '@shopify/app-bridge-react';
import {Banner, Card, Layout} from '@shopify/polaris';

import {ProductsList} from './ProductsList';

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

export function ProductsPage() {
  const {loading, error, data} = useQuery(PRODUCTS_QUERY);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Banner status="critical">There was an issue loading products.</Banner>
    );
  }

  return (
    <Layout.Section>
      <Card>
        <ProductsList products={data.products.edges.map(({node}) => node)} />
      </Card>
    </Layout.Section>
  );
}
