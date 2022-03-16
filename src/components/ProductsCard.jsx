import { useEffect, useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
  Button,
} from "@shopify/polaris";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { usePopulateProduct, randomTitle } from "../hooks/usePopulateProduct";
import { userLoggedInFetch } from "../App";

export function ProductsCard() {
  const [populateProduct] = usePopulateProduct();
  const [productCount, setProductCount] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
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

  return (
    <>
      {toastMarkup}
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

          <Button
            primary
            loading={buttonLoading}
            onClick={() => {
              setButtonLoading(true);
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
                setButtonLoading(false);
                updateProductCount();
                setHasResults(true);
              });
            }}
          >
            Populate 5 products
          </Button>
        </TextContainer>
      </Card>
    </>
  );
}
