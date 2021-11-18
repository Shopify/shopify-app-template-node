import { Layout, Page } from "@shopify/polaris";
import React from "react";

function PageLayout({ children }) {
  return (
    <Page>
      <Layout>{children}</Layout>
    </Page>
  );
}

export default PageLayout;
