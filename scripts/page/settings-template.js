const { toPascalCase } = require("../utilities");

const createSettingsPageTemplate = handle => {
  const componentName = toPascalCase(handle);
  return `import { Card, Layout, Page } from '@shopify/polaris';

const ${componentName} (
    <Page>
      <Layout>
        <Layout.AnnotatedSection
          title="Title"
          description="Description"
        >
          <Card>
            content
        </Card>
        </Layout.AnnotatedSection>
      </Layout>
      <Layout>
        <Layout.AnnotatedSection
          title="Title"
          description="Description"
        >
          <Card>
            content
        </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
      );
  export default ${componentName};`;
};

module.exports = createSettingsPageTemplate;
