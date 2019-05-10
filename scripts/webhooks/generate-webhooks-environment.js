const parseExpression = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash/get");
const generateWebhooksSubscription = require("./webhooks/generate-webhhoks-subscription");

const generateWebhooksEnvironment = (ast, url) => {
  const code = `const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});`;
  const package = `import { receiveWebhook } from '@shopify/koa-shopify-webhooks';`;
  let webhookDeclaration;
  let routerDeclaration;
  let enviroment;
  traverse(ast, {
    VariableDeclarator(path) {
      const indentifierName = get(path, ["node", "id", "name"]);
      if (indentifierName === "webhook") {
        webhookDeclaration = path;
      }
    }
  });

  traverse(ast, {
    VariableDeclarator(path) {
      const indentifierName = get(path, ["node", "id", "name"]);
      if (indentifierName === "router") {
        routerDeclaration = path.getStatementParent();
      }
    }
  });

  traverse(ast, {
    MemberExpression(path) {
      const dotEnv = get(path, ["node", "object", "name"]);
      if (dotEnv === "dotenv") {
        enviroment = path.getStatementParent();
      }
    }
  });

  if (webhookDeclaration) {
    return generateWebhooksSubscription(ast);
  }
  routerDeclaration.insertAfter(
    parseExpression(code, {
      sourceType: "module",
      allowAwaitOutsideFunction: true
    })
  );
  enviroment.insertBefore(
    parseExpression(package, {
      sourceType: "module",
      allowAwaitOutsideFunction: true
    })
  );
  return generateWebhooksSubscription(ast, url);
};

module.exports = generateWebhooksEnvironment;
