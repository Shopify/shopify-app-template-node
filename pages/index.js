import store from 'store-js';
import { EmptyState, Layout, Page } from '@shopify/polaris';
import ReusableResourcePicker from '../components/ResourcePicker';
import ResourceListWithProducts from '../components/ResourceList';

class Index extends React.Component {
  state = { open: false };
  render () {
    const emptyState = !store.get('ids');
    return (
      <React.Fragment>
        {emptyState ? (
          <Page
            primaryAction={{
              content: 'Select products',
              onAction: () => this.setState({ open: true }),
            }}>
            <Layout>
              {this.state.open && <ReusableResourcePicker update={this.handler} open={this.state.open} />}
              <EmptyState
                heading="Select products to start"
                action={{
                  content: 'Select Products',
                  onAction: () => this.setState({open: true}),
                }}
                image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
              >
                <p>Select products and change their price temporarily.</p>
              </EmptyState>
            </Layout>
          </Page>
        ) : (
          <ResourceListWithProducts />
        )}
      </React.Fragment>
    );
  }
  handler = () => {
    this.setState({
      open: false,
    });
  };
}

export default Index;
