const createWebhookUrl = type => {
  const transformedString = type.replace("_", "/");
  return `/webhooks/${transformedString.toLowerCase()}`;
};

const checkCasing = input => {
  return /[A-Z]/.test(input) && !input.includes("_") && !input.includes(" ");
};

const toPascalCase = input => {
  if (checkCasing(input)) {
    return input;
  }
  return input
    .match(/[a-z]+/gi)
    .map(function(word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    })
    .join("");
};

module.exports = {
  createWebhookUrl,
  toPascalCase
};
