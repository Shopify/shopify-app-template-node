const { createWebhookUrl } = require("../utilities");

it("should transform string into webhooks specific url", () => {
  expect(createWebhookUrl("TEST_CREATE")).toBe("/webhooks/test/create");
});
