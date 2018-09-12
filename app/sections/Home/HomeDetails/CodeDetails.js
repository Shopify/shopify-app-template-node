import * as React from 'react';
import QRCode from 'qrcode';
import {Page, Layout, Card, Button} from '@shopify/polaris';
import {getSerialized} from '@shopify/react-serialize';
import {ResourcePicker} from '@shopify/polaris/embedded';

import * as styles from './CodeDetails.scss';

export default class HomeDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      code: null,
    };
    this.openPicker = this.openPicker.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  openPicker() {
    this.setState({open: true});
  }

  handleSelection(resource) {
    const handle = resource.products[0].handle;
    const url = `https://${getSerialized('shopOrigin').data}/products/${handle}`;
    QRCode.toDataURL(url, (err, code) => {
      if (err) {
        return;
      }
      this.setState({open: false, code, url});
    });
  }

  handleCancel() {
    this.setState({open: false});
  }

  render() {
    const codeMarkup = this.state.code ? (
      <p>
        <a href={this.state.url} target="_blank">
          <img src={this.state.code} alt="test" width="180" height="180" />
        </a>
      </p>
    ) : (
      <p className={styles.Placeholder}>Generated QR Code will appear here</p>
    );

    return (
      <Page title="QR Code creator">
        <ResourcePicker
          products
          allowMultiple={false}
          open={this.state.open}
          onSelection={this.handleSelection}
          onCancel={this.handleCancel}
        />
        <Layout>
          <Layout.Section>
            <Card title="QR Code creator">
              <Card.Section>
                <p>Select a product to generate a QR Code for a product</p>
              </Card.Section>
              <Card.Section>
                <Button onClick={this.openPicker}>
                  Select product
                </Button>
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card subdued>
              <Card.Section>
                {codeMarkup}
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
}
