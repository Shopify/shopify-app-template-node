import { Card, Layout, Page } from "@shopify/polaris";
import React from "react";

function PageLayout({ children }) {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>{children}</Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default PageLayout;
