import React from "react";
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import {
  Provider as AppBridgeProvider,
  useAppBridge,
} from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

import ProductsPage from "./ProductsPage";
import PageLayout from "./PageLayout";

import rateLimit from "../rateLimit";

function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}
const MyProvider = ({ children }) => {
  const app = useAppBridge();

  const http = new HttpLink({
    credentials: "include",
    fetch: userLoggedInFetch(app),
  });

  const link = new ApolloLink.from([rateLimit, http]);

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const App = () => {
  return (
    <PolarisProvider i18n={translations}>
      <AppBridgeProvider
        config={{
          apiKey: API_KEY,
          host: new URL(location).searchParams.get("host"),
          forceRedirect: true,
        }}
      >
        <MyProvider>
          <PageLayout>
            <ProductsPage />
          </PageLayout>
        </MyProvider>
      </AppBridgeProvider>
    </PolarisProvider>
  );
};

export default App;
