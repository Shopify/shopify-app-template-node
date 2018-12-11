import {
  Banner,
  Card,
  DisplayText,
  Form,
  FormLayout,
  Layout,
  Page,
  PageActions,
  TextField,
  Toast,
} from '@shopify/polaris';
import store from 'store-js';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const UPDATE_PRICE = gql`
 mutation productVariantUpdate($input: ProductVariantInput!) {
   productVariantUpdate(input: $input) {
     product {
       title
     }
     productVariant {
       id
       price
     }
   }
 }
`;

class EditProduct extends React.Component {
  state = {
    discount: '',
    price: '',
    variantId: '',
    showToast: false,
  };

  componentDidMount() {
    this.setState({ discount: this.setUpItemToBeConsumedByForm() });
  }

  render() {
    const { name, price, discount, variantId, showToast } = this.state;

    return (
      return (
        <Mutation
          mutation={UPDATE_PRICE}
        >
        {(handleSubmit, {error, data}) => {
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const showToast = data && data.productVariantUpdate && (
            <Toast
              content="Sucessfully updated"
              onDismiss={() => this.setState({ showToast: false })}
            />
          );
          return (
          <Page>
            <Layout>
              {showToast}
              {showError}
              <Layout.Section>
                <DisplayText size="large">{name}</DisplayText>
                <Form>
                  <Card sectioned>
                    <FormLayout>
                      <FormLayout.Group>
                        <TextField
                          prefix="$"
                          value={price}
                          disabled={true}
                          label="Original price"
                          type="price"
                        />
                        <TextField
                          prefix="$"
                          value={discount}
                          onChange={this.handleChange('discount')}
                          label="Discounted price"
                          type="discount"
                        />
                      </FormLayout.Group>
                      <p>
                        This sale price will expire in two weeks on{' '}
                        {this.props.expires}
                      </p>
                    </FormLayout>
                  </Card>
                  <PageActions
                    primaryAction={[
                      {
                        content: 'Save',
                        onAction: () => {
                          const productVariableInput = {
                            id: variantId,
                            price: discount,
                          };
                          handleSubmit({
                            variables: { input: productVariableInput }
                          });
                        },
                      },
                    ]}
                    secondaryActions={[
                      {
                        content: 'Remove Discount',
                      },
                    ]}
                  />
                </Form>
              </Layout.Section>
            </Layout>
          </Page>
          )
        }}
      </Mutation>
    );
  }

  handleChange = (field) => {
    return (value) => this.setState({ [field]: value });
  };

  setUpItemToBeConsumedByForm = () => {
    const item = store.get('item');
    const price = item.variants.edges[0].node.price;
    const variantId = item.variants.edges[0].node.id;
    const discounter = price * 0.1;
    this.setState({ price: price, variantId: variantId });
    return (price - discounter).toFixed(2);
  };
}

export default EditProduct;
