const { toPascalCase } = require("../utilities");

const createEmptyStateTemplate = handle => {
  const componentName = toPascalCase(handle);
  return `import { EmptyState, Page } from "@shopify/polaris";

const ${componentName} = () => (
  <Page>
    <EmptyState
      heading="Manage your inventory transfers"
      action={{ content: 'Add transfer' }}
      secondaryAction={{ content: 'Learn more', url: 'https://help.shopify.com' }}
      image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
    >
      <p>Track and receive your incoming inventory from suppliers.</p>
    </EmptyState>
  </Page>
)
export default ${componentName};`;
};

module.exports = createEmptyStateTemplate;
