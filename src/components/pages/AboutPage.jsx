import { Card, DescriptionList, Layout, Link, Page } from "@shopify/polaris";

import { ShopData } from "../ShopData";

export function AboutPage() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "5px 20px" }}>
              <DescriptionList
                items={[
                  {
                    term: "API package version",
                    description: SHOPIFY_LIBRARY_VERSION,
                  },
                  {
                    term: "App repository",
                    description: (
                      <Link
                        url="https://github.com/Shopify/shopify-app-node"
                        external
                      >
                        https://github.com/Shopify/shopify-app-node
                      </Link>
                    ),
                  },
                  {
                    term: "CLI repository",
                    description: (
                      <Link
                        url="https://github.com/Shopify/shopify-cli"
                        external
                      >
                        https://github.com/Shopify/shopify-cli
                      </Link>
                    ),
                  },
                  {
                    term: "Store information",
                    description: <ShopData />,
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
