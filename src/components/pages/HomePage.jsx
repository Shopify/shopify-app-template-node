import {
  Card,
  DisplayText,
  Layout,
  List,
  Page,
  Stack,
  TextContainer,
} from "@shopify/polaris";

export function HomePage() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <div style={{ textAlign: "center" }}>
            <TextContainer spacing="loose">
              <DisplayText size="large">Congratulations! 🥳</DisplayText>
              <DisplayText size="large">
                You've created your first app!
              </DisplayText>
            </TextContainer>
          </div>
        </Layout.Section>
        <Layout.Section>
          <div style={{ marginTop: 20 }}>
            <Card sectioned>
              <div style={{ padding: "30px 0" }}>
                <TextContainer spacing="loose">
                  <p>Welcome to the Shopify App Ecosystem!</p>
                  <p>
                    You've just scaffolded your first app. This app template
                    comes with the key Shopify building blocks to help you build
                    your app.
                  </p>
                  <p>
                    Under the hood, this app is using the Polaris design system,
                    Shopify's Admin API, and App Bridge - Shopify's library that
                    allows you to expose your app in the Merchant Admin.
                  </p>
                  <p>
                    Want to keep learning more? Click on the big red button on
                    the right
                  </p>
                </TextContainer>
              </div>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
      <Stack wrap={false} distribution="center">
        <Layout.Section>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Card sectioned>
              <TextContainer spacing="loose">
                <p>Want to continue learning?</p>
                <p>Try building a QR code app next</p>
              </TextContainer>
            </Card>
          </div>
        </Layout.Section>
      </Stack>
    </Page>
  );
}
