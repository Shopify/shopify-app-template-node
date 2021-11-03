import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Layout, Button, Banner, Toast, Stack, Frame } from "@shopify/polaris";
import { Loading } from "@shopify/app-bridge-react";

// GraphQL mutation that updates the prices of products
const UPDATE_PRICE = gql`
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      product {
        title
      }
      productVariant {
        id
        price
      }
    }
  }
`;

function ApplyRandomPrices(props) {
  const { selectedItems, onUpdate } = props;
  const [hasResults, setHasResults] = useState(false);

  const toast = hasResults && (
    <Toast
      content="Successfully updated"
      onDismiss={() => setHasResults(false)}
    />
  );
  const [mutateFunction, { data, loading, error }] = useMutation(UPDATE_PRICE);
  if (loading) return <Loading />;

  if (error) {
    console.warn(error);
    return <Banner status="critical">{error.message}</Banner>;
  }

  return (
    <Frame>
      {toast}

      <Layout.Section>
        <Stack distribution={"center"}>
          <Button
            primary
            textAlign={"center"}
            onClick={() => {
              let promise = new Promise((resolve) => resolve());
              for (const variantId in selectedItems) {
                const price = Math.random().toPrecision(3) * 10;
                const productVariableInput = {
                  id: selectedItems[variantId].variants.edges[0].node.id,
                  price: price,
                };

                promise = promise.then(() =>
                  mutateFunction({
                    variables: { input: productVariableInput },
                  })
                );
              }

              if (promise) {
                promise.then(() => onUpdate().then(setHasResults(true)));
              }
            }}
          >
            Randomize prices
          </Button>
        </Stack>
      </Layout.Section>
    </Frame>
  );
}

export default ApplyRandomPrices;
