const generate = require("@babel/generator").default;
const parser = require("@babel/parser").parse;
const {
  auth,
  authWithHandler,
  transformedAuthWithHandler,
  transformedAuth
} = require("./server-mocks");
const generateRecurringBilling = require("../billing/generate-recurring-billing");

it("should return the new code with call to billing api", () => {
  const ast = parser(auth, { sourceType: "module" });
  const parsedAst = generateRecurringBilling(ast);
  const newCode = generate(parsedAst).code;
  expect(newCode).toBe(transformedAuth);
});

it("should replace handler if you've already generated billing code", () => {
  const ast = parser(authWithHandler, { sourceType: "module" });
  const parsedAst = generateRecurringBilling(ast);
  const newCode = generate(parsedAst).code;
  expect(newCode).toBe(transformedAuthWithHandler);
});
