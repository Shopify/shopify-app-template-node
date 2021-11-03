import React from "react";
import { Page, Layout, EmptyState } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";

function EmptyStatePage({ setSelection }) {
  const [open, setOpen] = React.useState(false);
  const handleSelection = (resources) => {
    setOpen(false);
    setSelection(resources.selection.map((product) => product.id));
  };
  return (
    <Page>
      <TitleBar
        primaryAction={{
          content: "Select products",
          onAction: () => setOpen(true),
        }}
      />
      <ResourcePicker // Resource picker component
        resourceType="Product"
        showVariants={false}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setOpen(false)}
      />
      <Layout>
        <EmptyState
          heading="Discount your products temporarily"
          action={{
            content: "Select products",
            onAction: () => setOpen(true),
          }}
          image={
            "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
          }
        >
          <p>Select products to change their price temporarily.</p>
        </EmptyState>
      </Layout>
    </Page>
  );
}

export default EmptyStatePage;
