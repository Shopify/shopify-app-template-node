const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const get = require('lodash/get');

const code = `server.context.client = handlers.createClient(ctx.session);
await handlers.getSubscriptionUrl(ctx);
`
const generateRecurringBilling = (ast) => {
  let redirectAfterAuth;
  traverse(ast, {
    ExpressionStatement(path) {
      const getName = (get(path, ['node', 'expression', 'callee', 'object', 'name']))
      if (getName === 'ctx') {
        redirectAfterAuth = path;
      }
    }
  })

  if (!redirectAfterAuth) {
    return ast;
  }

  redirectAfterAuth.replaceWith(parser(code, { sourceType: 'module', allowAwaitOutsideFunction: true }));
  return ast;
};

module.exports = generateRecurringBilling;
