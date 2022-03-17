import { useEffect, useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
} from "@shopify/polaris";
import { TitleBar, Toast, useAppBridge } from "@shopify/app-bridge-react";
import { usePopulateProduct, randomTitle } from "../hooks/usePopulateProduct";
import { userLoggedInFetch } from "../App";

export function ProductsCard() {
  const [populateProduct, { loading }] = usePopulateProduct();
  const [productCount, setProductCount] = useState(0);
  const [hasResults, setHasResults] = useState(false);

  const app = useAppBridge();
  const fetch = userLoggedInFetch(app);
  async function updateProductCount() {
    const { count } = await fetch("/products-count").then((res) => res.json());
    setProductCount(count);
  }

  useEffect(() => {
    updateProductCount();
  }, []);

  const toastMarkup = hasResults && (
    <Toast
      content="5 products created!"
      onDismiss={() => setHasResults(false)}
    />
  );

  const primaryAction = {
    content: "Populate 5 products",
    loading,
    onAction: () => {
      Promise.all(
        Array.from({ length: 5 }).map(() =>
          populateProduct({
            variables: {
              input: {
                title: randomTitle(),
              },
            },
          })
        )
      ).then(() => {
        updateProductCount();
        setHasResults(true);
      });
    },
  };

  return (
    <>
      {toastMarkup}
      <TitleBar primaryAction={primaryAction} />
      <Card title="Product Counter" sectioned>
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">{productCount}</TextStyle>
            </DisplayText>
          </Heading>
        </TextContainer>
      </Card>
    </>
  );
}
