import React from "react";
import { Layout, Page } from "@shopify/polaris";

function PageLayout({ children }) {
  return (
    <Page>
      <Layout>{children}</Layout>
    </Page>
  );
}

export default PageLayout;
