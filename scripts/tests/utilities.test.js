const { createWebhooksUrl } = require("../utilities");

it("should transform string into webhooks specific url", () => {
  expect(createWebhooksUrl("TEST_CREATE")).toBe("/webhooks/test/create");
});
