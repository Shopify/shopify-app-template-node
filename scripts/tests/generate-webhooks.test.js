const generateWebhooks = require("../webhooks/generate-webhooks");
const parser = require("@babel/parser").parse;
const generate = require("@babel/generator").default;
const {
  server,
  transformedWithMoreWebhooks,
  transformedWithWebhooksandEnv,
  scopes
} = require("./server-mocks");

it("should return the new code with call to billing api", () => {
  const ast = parser(server, { sourceType: "module" });
  const parsedAst = generateWebhooks(ast, "TEST_TYPE");
  const newCode = generate(parsedAst).code;
  expect(newCode).toBe(transformedWithWebhooksandEnv);
});

it("should only add the webhook subscription and registration if receiveWehook is already in file", () => {
  const ast = parser(transformedWithWebhooksandEnv, { sourceType: "module" });
  const parsedAst = generateWebhooks(ast, "TEST_TWO");
  const newCode = generate(parsedAst).code;
  expect(newCode).toBe(transformedWithMoreWebhooks);
});

it("should not add new scope if scope is already there", () => {
  const ast = parser(scopes, { sourceType: "module" });
  const parsedAst = generateWebhooks(ast, "TEST_TWO");
  const newCode = generate(parsedAst).code;
  expect(newCode).toBe(scopes);
});
