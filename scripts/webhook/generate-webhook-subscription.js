const parseExpression = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash.get");
const { createWebhookUrl } = require("../utilities");
const generateWebhookEnvironment = require("./generate-webhook-environment");

const generateWebhookSubscription = (ast, type) => {
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
  const code = `router.post('${createWebhookUrl(type)}', webhook, (ctx) => {
    console.log('received webhook: ', ctx.state.webhook);
  });`;

  verifyMiddleware.insertBefore(
    parseExpression(code, {
      sourceType: "module"
    })
  );
  return generateWebhookEnvironment(ast);
};

module.exports = generateWebhookSubscription;
