const parser = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash.get");
const generateWebhookSubcription = require("./generate-webhook-subscription");
const { createWebhookUrl } = require("../utilities");

const generateWebhook = (ast, type) => {
  let sessionAssignment;
  traverse(ast, {
    VariableDeclaration(path) {
      const variableinAuth = get(path, ["node", "declarations"])[0];
      const properties = get(variableinAuth, ["id", "properties"]);
      if (properties) {
        properties.filter(prop => {
          return get(prop, ["key", "name"]) == "shop";
        });
        sessionAssignment = path;
      }
    }
  });

  if (!sessionAssignment) {
    return ast;
  }
  const code = `await handlers.registerWebhooks(shop, accessToken, '${type}', '${createWebhookUrl(
    type
  )}'); `;
  sessionAssignment.insertAfter(
    parser(code, { sourceType: "module", allowAwaitOutsideFunction: true })
  );
  return generateWebhookSubcription(ast, type);
};

module.exports = generateWebhook;
