import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import {useAppBridge} from '@shopify/app-bridge-react';
import {Provider as AppBridgeProvider} from '@shopify/app-bridge-react/components';
import {authenticatedFetch} from '@shopify/app-bridge-utils';
import {Redirect} from '@shopify/app-bridge/actions';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';

import App from './App';
import {PageLayout} from './components/PageLayout';
import {ProductsPage} from './components/ProductsPage';

ReactDOM.hydrate(
  <BrowserRouter>
    <App>
      <AppBridgeProvider
        config={{
          apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
          host: new URL(location).searchParams.get('host'),
          forceRedirect: true,
        }}
      >
        <MyProvider>
          <PageLayout>
            <ProductsPage />
          </PageLayout>
        </MyProvider>
      </AppBridgeProvider>
    </App>
  </BrowserRouter>,
  document.getElementById('app'),
);

function MyProvider({children}) {
  const app = useAppBridge();

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      credentials: 'include',
      fetch: userLoggedInFetch(app),
    }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1'
    ) {
      const authUrlHeader = response.headers.get(
        'X-Shopify-API-Request-Failure-Reauthorize-Url',
      );

      console.log('HEY IAIN');

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}
