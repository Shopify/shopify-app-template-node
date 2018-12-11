import { ResourcePicker } from '@shopify/polaris';
import store from 'store-js';

class ReusableResourcePicker extends React.Component {
  state = {
    open: this.props.open,
  };
  render() {
    return (
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={this.state.open}
        onSelection={(resources) => {
          this.handleSelection(resources);
          this.props.update();
        }}
        onCancel={() => this.setState({ open: false })}
      />
    );
  }
  handleSelection(resources) {
    console.log('Selected products: ', resources.selection);
    const idsFromResources = resources.selection.map((product) => product.id);
    store.set('ids', idsFromResources);
    this.setState({open: false});
  }
}

export default ReusableResourcePicker;
