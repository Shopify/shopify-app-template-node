import {
  Card,
  DescriptionList,
  DisplayText,
  Layout,
  List,
  Page,
  TextContainer,
} from "@shopify/polaris";

export function ResourcesPage() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "5px 20px" }}>
              <DescriptionList
                items={[
                  {
                    term: "App Bridge",
                    description: "App Bridge is really cool!",
                  },
                  {
                    term: "Admin API",
                    description: "Here are some docs for the Admin API.",
                  },
                  {
                    term: "Polaris",
                    description: "Make your app beautiful with Polaris!",
                  },
                ]}
              />
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
