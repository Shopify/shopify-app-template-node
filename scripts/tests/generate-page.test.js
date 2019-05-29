const generatePage = require("../page/generate-page");
const fs = require("fs");

const content = `import { Heading, Page } from \"@shopify/polaris\";

const Index = () => (
  <Page>
    <Heading>You created a new page called Index</Heading>
    <p>You can visit this page by appending \"/Index\" to your URL</p>
    <p>For information on Next.js dynamic routing <a href=\"https://nextjs.org/learn/basics/navigate-between-pages\" target=\"_blank\">check out their documentation</a></p>
    <p>For information about navigation within the admin frame, <a href=\"https://help.shopify.com/en/api/embedded-apps/app-extensions/navigation/create-navigation-link\" target=\"_blank\">see the Shopify documentation.</a></p>
  </Page>
)
export default Index;`;

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
  existsSync: page => {
    if (page === "pages/test.js") {
      return true;
    } else {
      return false;
    }
  }
}));

it("should call writeFile if file does not exist", () => {
  generatePage("pages", ["npm", "run-script", "generate-page", "index"]);
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    "pages/index.js",
    content,
    expect.any(Function)
  );
});

it("should call not writeFile if file does exist", () => {
  generatePage("pages", ["npm", "run-script", "generate-page", "test"]);
  const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");
  expect(writeFileSyncSpy).toHaveBeenCalledTimes(0);
});
