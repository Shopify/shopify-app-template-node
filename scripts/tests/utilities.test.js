const { createWebhookUrl } = require("../utilities");
const { toPascalCase } = require("../utilities");

it("should transform string into webhooks specific url", () => {
  expect(createWebhookUrl("TEST_CREATE")).toBe("/webhooks/test/create");
});

it("should transform string and remove characters to create PascalCase string", () => {
  expect(toPascalCase("TEST_CREATE")).toBe("TestCreate");
  expect(toPascalCase("test cREATE")).toBe("TestCreate");
  expect(toPascalCase("test create!~")).toBe("TestCreate");
});
