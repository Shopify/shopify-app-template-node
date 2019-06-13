const generate = require("@babel/generator").default;
const parser = require("@babel/parser").parse;
const generateWebhook = require("../webhook/generate-webhook");
const {
  server,
  transformedWithMoreWebhooks,
  transformedWithWebhooksandEnv
} = require("./server-mocks");

it("should return the new code with registered webhooks", () => {
  const ast = parser(server, { sourceType: "module" });
  const parsedAst = generateWebhook(ast, "TEST_TYPE");
  const newCode = generate(parsedAst).code;
  expect(newCode).toBe(transformedWithWebhooksandEnv);
});

it("should only add the webhook subscription and registration if receiveWehook is already in file", () => {
  const ast = parser(transformedWithWebhooksandEnv, { sourceType: "module" });
  const parsedAst = generateWebhook(ast, "TEST_TWO");
  const newCode = generate(parsedAst).code;
  expect(newCode).toBe(transformedWithMoreWebhooks);
});
