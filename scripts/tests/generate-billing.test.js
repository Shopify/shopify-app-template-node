const generateRecurringBilling = require('../generate-recurring-billing.js')

const server = `server.use(
  createShopifyAuth({
    apiKey: 'randomstring',
    secret: 'randomstring2',
    scopes: ["read_products"],

    async afterAuth(ctx) {
      //Auth token and shop available in sesssion
      //Redirect to shop upon auth
      const { shop } = ctx.session;
      ctx.redirect("/")
    }
  })
)`;


it('should return an ast', () => {
  generateRecurringBilling('server/server.js', server)
  expect(traverse).toHaveBeenCalled();
});
