const replace = require("lodash/replace");
const lowerCase = require("lodash/lowerCase");

const createWebhooksUrl = type => {
  const transformedString = replace(lowerCase(type), " ", "/");
  return `/webhooks/${transformedString}`;
};
module.exports = {
  createWebhooksUrl
};
