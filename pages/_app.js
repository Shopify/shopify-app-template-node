import App, { Container } from "next/app";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/styles.css";

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
          <Component {...pageProps} />
        </AppProvider>
      </Container>
    );
  }
}

export default MyApp;
