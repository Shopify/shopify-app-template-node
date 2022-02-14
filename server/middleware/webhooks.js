const {default: Shopify} = require('@shopify/shopify-api');

module.exports = function webhooksMiddleware(app) {
  app.post('/webhooks', async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });
};
