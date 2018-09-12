import * as React from 'react';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';

import {AppProvider} from '@shopify/polaris';
import {getSerialized} from '@shopify/react-serialize';
import Link from '../Link';
import Routes from '../Routes';

const client = new ApolloClient({
  fetchOptions: {
    credentials: 'include',
  },
});

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {workaround: false};
  }

  componentDidMount() {
    // This happens in browser - therefore we are ready to use `window`
    this.setState({workaround: true});
  }

  render() {
    if (!this.state.workaround) {
      return <div />;
    }

    return (
      <ApolloProvider client={client}>
        <AppProvider
          apiKey={getSerialized('apiKey').data}
          shopOrigin={`https://${getSerialized('shopOrigin').data}`}
          linkComponent={Link}
          forceRedirect
          debug
        >
          <Routes />
        </AppProvider>
      </ApolloProvider>
    );
  }
}
