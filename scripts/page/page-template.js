const { toPascalCase } = require("../utilities");

const createPageTemplate = handle => {
  const componentName = toPascalCase(handle);
  return `import { Heading, Page } from "@shopify/polaris";

const ${componentName} = () => (
  <Page>
    <Heading>You created a new page called ${componentName}</Heading>
    <p>You can visit this page by appending "/${componentName}" to your URL</p>
    <p>For information on Next.js dynamic routing <a href="https://nextjs.org/learn/basics/navigate-between-pages" target="_blank">check out their documentation</a></p>
    <p>For information about navigation within the admin frame, <a href="https://help.shopify.com/en/api/embedded-apps/app-extensions/navigation/create-navigation-link" target="_blank">see the Shopify documentation.</a></p>
  </Page>
)
export default ${componentName};`;
};

module.exports = createPageTemplate;
