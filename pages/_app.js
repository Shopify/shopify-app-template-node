import App, { Container } from "next/app";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import "@shopify/polaris/styles.css";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include"
  }
});
class MyApp extends App {
  static async getInitialProps(server) {
    const shopOrigin = server.ctx.query.shop;
    return { shopOrigin };
  }
  render() {
    const { Component, pageProps, shopOrigin } = this.props;
    return (
      <Container>
        <AppProvider>
          <Provider config={{ apiKey: API_KEY, shopOrigin: shopOrigin }}>
            <ApolloProvider client={client}>
              <Component {...pageProps} />
            </ApolloProvider>
          </Provider>
        </AppProvider>
      </Container>
    );
  }
}

export default MyApp;
