const traverse = require("@babel/traverse").default;
const get = require("lodash/get");
const t = require("@babel/types");

const generateWebhooks = ast => {
  let appScope;
  const scope = "write_products";
  const hasItem = item => item.value === scope;
  traverse(ast, {
    Property(path) {
      const getLine = get(path, ["node", "key", "name"]);
      const getNode = get(path, ["node", "value", "elements"]);
      if (getLine === "scopes") {
        appScope = getNode;
      }
    }
  });
  if (!appScope) {
    return ast;
  }
  if (!appScope.find(hasItem)) {
    appScope.push(t.stringLiteral(scope));
  }
  return ast;
};

module.exports = generateWebhooks;
