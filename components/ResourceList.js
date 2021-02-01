import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';

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

class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  render() {
    const app = this.context;
    const redirectToProduct = () => {
      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.APP,
        '/edit-products',
      );
    };

    const twoWeeksFromNow = new Date(Date.now() + 12096e5).toDateString();

    return (
      <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get('ids') }}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;

          return (
            <Card>
              <ResourceList
                showHeader
                resourceName={{ singular: 'Product', plural: 'Products' }}
                items={data.nodes}
                renderItem={item => {
                  const media = (
                    <Thumbnail
                      source={
                        item.images.edges[0]
                          ? item.images.edges[0].node.originalSrc
                          : ''
                      }
                      alt={
                        item.images.edges[0]
                          ? item.images.edges[0].node.altText
                          : ''
                      }
                    />
                  );
                  const price = item.variants.edges[0].node.price;
                  return (
                    <ResourceList.Item
                      id={item.id}
                      media={media}
                      accessibilityLabel={`View details for ${item.title}`}
                      onClick={() => {
                        store.set('item', item);
                        redirectToProduct();
                      }}
                    >
                      <Stack>
                        <Stack.Item fill>
                          <h3>
                            <TextStyle variation="strong">
                              {item.title}
                            </TextStyle>
                          </h3>
                        </Stack.Item>
                        <Stack.Item>
                          <p>${price}</p>
                        </Stack.Item>
                        <Stack.Item>
                          <p>Expires on {twoWeeksFromNow} </p>
                        </Stack.Item>
                      </Stack>
                    </ResourceList.Item>
                  );
                }}
              />
            </Card>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithProducts;
