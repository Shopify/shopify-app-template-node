import {Layout, Page} from '@shopify/polaris';

export function PageLayout({children}) {
  return (
    <Page>
      <Layout>{children}</Layout>
    </Page>
  );
}
