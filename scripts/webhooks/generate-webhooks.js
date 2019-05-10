const parser = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash/get");
const generateWebhooksEnvironment = require("./webhooks/generate-webhooks-environment");

const generateWebhooks = (ast, type, url) => {
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
  console.log(url);
  console.log(type);
  const code = `handlers.registerWebhooks(shop, accessToken, ${type}, "${url}");`;
  console.log(code);
  sessionAssignment.insertAfter(
    parser(code, { sourceType: "module", allowAwaitOutsideFunction: true })
  );
  return generateWebhooksEnvironment(ast, url);
};

module.exports = generateWebhooks;
