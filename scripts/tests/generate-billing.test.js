const generateRecurringBilling = require('../generate-recurring-billing')
const parser = require('@babel/parser').parse;
const transform = require('../transform');
const generate = require('@babel/generator').default;
const fs = require('fs');


const server = `createShopifyAuth({
    async afterAuth(ctx) {
      const { shop } = ctx.session;
      ctx.redirect("/")
    }
  })`;

const transformed = `createShopifyAuth({
  async afterAuth(ctx) {
    const {
      shop
    } = ctx.session;
    server.context.client = handlers.createClient(ctx.session);
    await handlers.getSubscriptionUrl(ctx);
  }

});`

it('Should return the new code with call to billing api', () => {
  const ast = parser(server, { sourceType: 'module' });
  const parsedAst = generateRecurringBilling(ast);
  const newCode = generate(parsedAst).code
  expect(newCode).toBe(transformed)
});
