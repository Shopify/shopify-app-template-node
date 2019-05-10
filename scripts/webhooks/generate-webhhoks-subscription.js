const parseExpression = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash/get");

const generateWebhooksSubscription = (ast, type, url) => {
  let verifyMiddleware;
  traverse(ast, {
    CallExpression(path) {
      const test = get(path, ["node", "callee", "name"]);
      if (test === "verifyRequest") {
        verifyMiddleware = path.getStatementParent();
      }
    }
  });

  if (!verifyMiddleware) {
    return ast;
  }
  const code = `router.post('/webhooks/products/create', webhook, (ctx) => {
    console.log('received webhook: ', ctx.state.webhook);
  });`;

  verifyMiddleware.insertBefore(
    parseExpression(code, {
      sourceType: "module",
      allowAwaitOutsideFunction: true
    })
  );
  return ast;
};

module.exports = generateWebhooksSubscription;
