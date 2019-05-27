const createWebhookUrl = type => {
  const transformedString = type.replace("_", "/");
  return `/webhooks/${transformedString.toLowerCase()}`;
};
module.exports = {
  createWebhookUrl
};
