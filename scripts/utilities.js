const createWebhooksUrl = type => {
  const transformedString = type.replace("_", "/");
  return `/webhooks/${transformedString.toLowerCase()}`;
};

toPascalCase = input => {
  return input
    .match(/[a-z]+/gi)
    .map(function(word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    })
    .join("");
};

module.exports = {
  createWebhooksUrl,
  toPascalCase
};
