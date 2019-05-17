const createWebhooksUrl = type => {
  const transformedString = type.replace("_", "/");
  return `/webhooks/${transformedString.toLowerCase()}`;
};
module.exports = {
  createWebhooksUrl
};
