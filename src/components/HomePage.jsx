import { Loading } from "@shopify/app-bridge-react";
import {
  Banner,
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
} from "@shopify/polaris";

import { ProductsCard } from "./ProductsCard";

export function HomePage() {
  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <Card sectioned title="Nice work on building a Shopify app 🎉">
            <Stack wrap={false} spacing="extraTight">
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <p style={{ marginTop: 20 }}>
                    Your app is ready to explore! It contains everything you
                    need to get started including the Polaris design system,
                    Shopify Admin API, and App Bridge UI library and components.
                  </p>

                  <p>
                    Ready to go? Start populating your app with some sample
                    products to view and test in your store.
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 48px 20px 20px" }}>
                  <Image
                    source="/assets/home-trophy.png"
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
