const parseExpression = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash.get");

const generateWebhookEnvironment = ast => {
  const code = `const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});`;
  const importPackage = `import { receiveWebhook } from '@shopify/koa-shopify-webhooks';`;
  let webhookDeclaration;
  let routerDeclaration;
  let env;
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
        env = path.getStatementParent();
      }
    }
  });

  if (webhookDeclaration) {
    return ast;
  }
  routerDeclaration.insertAfter(
    parseExpression(code, {
      sourceType: "module"
    })
  );
  env.insertBefore(
    parseExpression(importPackage, {
      sourceType: "module"
    })
  );
  return ast;
};

module.exports = generateWebhookEnvironment;
