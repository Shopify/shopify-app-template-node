const generateRecurringBilling = require("../billing/generate-recurring-billing");
const parser = require("@babel/parser").parse;
const generate = require("@babel/generator").default;
const {
  auth,
  authWithHandler,
  transformedAuthWithHandler,
  transformedAuth
} = require("./server-mocks");

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
