const parser = require("@babel/parser").parse;
const traverse = require("@babel/traverse").default;
const get = require("lodash.get");

const client = `server.context.client = await handlers.createClient(shop, accessToken)`;
const handlerLine = `await handlers.getOneTimeUrl(ctx)`;
const generateOneTimeCharge = ast => {
  let redirectAfterAuth;
  let handlerPath;
  traverse(ast, {
    ExpressionStatement(path) {
      const getName = get(path, [
        "node",
        "expression",
        "callee",
        "object",
        "name"
      ]);
      const getIdentifier = get(path, [
        "node",
        "expression",
        "argument",
        "callee",
        "property",
        "name"
      ]);
      if (getName === "ctx") {
        redirectAfterAuth = path;
      }
      if (getIdentifier === "getSubscriptionUrl") {
        handlerPath = path;
      }
    }
  });

  if (!redirectAfterAuth && !handlerPath) {
    return ast;
  }

  if (handlerPath) {
    handlerPath.replaceWith(
      parser(handlerLine, {
        sourceType: "module",
        allowAwaitOutsideFunction: true
      })
    );
  }
  if (redirectAfterAuth) {
    redirectAfterAuth.insertBefore(
      parser(client, { sourceType: "module", allowAwaitOutsideFunction: true })
    );
    redirectAfterAuth.replaceWith(
      parser(handlerLine, {
        sourceType: "module",
        allowAwaitOutsideFunction: true
      })
    );
  }
  return ast;
};

module.exports = generateOneTimeCharge;
