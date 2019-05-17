const parseExpression = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash.get");
const { createWebhooksUrl } = require("../utilities");
const generateWebhooksEnvironment = require("./generate-webhooks-environment");

const generateWebhooksSubscription = (ast, type) => {
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
  const code = `router.post('${createWebhooksUrl(type)}', webhook, (ctx) => {
    console.log('received webhook: ', ctx.state.webhook);
  });`;

  verifyMiddleware.insertBefore(
    parseExpression(code, {
      sourceType: "module"
    })
  );
  return generateWebhooksEnvironment(ast);
};

module.exports = generateWebhooksSubscription;
