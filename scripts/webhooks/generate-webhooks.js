const parser = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash.get");
const generateWebhooksSubcription = require("./generate-webhhoks-subscription");
const { createWebhooksUrl } = require("../utilities");

const generateWebhooks = (ast, type) => {
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
  const code = `await handlers.registerWebhooks(shop, accessToken, '${type}', '${createWebhooksUrl(
    type
  )}'); `;
  sessionAssignment.insertAfter(
    parser(code, { sourceType: "module", allowAwaitOutsideFunction: true })
  );
  return generateWebhooksSubcription(ast, type);
};

module.exports = generateWebhooks;
