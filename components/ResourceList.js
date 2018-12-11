import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Card,
  Page,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from '@shopify/polaris';
import store from 'store-js';
import ReusableResourcePicker from '../components/ResourcePicker';
import { Redirect } from '@shopify/app-bridge/actions';
import * as PropTypes from 'prop-types';

const GET_PRODUCTS_BY_ID = gql`
  query getProducts($id: [ID!]!) {
    nodes(ids: $id) {
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
  state = {
    item: '',
    open: false
  };

  static contextTypes = {
    polaris: PropTypes.object
  };

  render() {
    const twoWeeksFromNow = new Date(Date.now() + 12096e5).toDateString();
    const redirect = Redirect.create(this.context.polaris.appBridge);
    return (
      <Query query={GET_PRODUCTS_BY_ID} variables={{ id: store.get('ids') }}>
        {({ data, loading, error }) => {
          if (loading) return 'Loading...';
          if (error) return `Error! ${error.message}`;
          console.log(data);
          return (
            <Page
              primaryAction={{
               content: 'Add products',
               onAction: () => this.setState({ open: true })
             }}
           >
             {this.state.open && (
               <ReusableResourcePicker
                 update={this.handler}
                 open={this.state.open}
               />
             )}>
              <Card sectioned>
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
                           ? item.images.edges[0].node.originalSrc
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
                         redirect.dispatch(
                            Redirect.Action.APP,
                            '/edit-products'
                          );
                        }
                      }
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
            </Page>
          );
        }}
      </Query>
    );
  }

  handler = () => {
    this.setState({
      open: false
    });
 };
}

export default ResourceListWithProducts;
