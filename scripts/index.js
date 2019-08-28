function receiveArgs(args) {
  const type = args[2];
  switch (type) {
    case "generate-page": {
      const generatePage = require("./page/generate-page");
      const createPageTemplate = require("./page/page-template");
      generatePage(createPageTemplate, "pages", args);
      break;
    }
    case "generate-empty-state-page": {
      const generatePage = require("./page/generate-page");
      const createEmptyStateTemplate = require("./page/empty-state-template");
      generatePage(createEmptyStateTemplate, "pages", args);
      break;
    }
    case "generate-two-column-page": {
      const generatePage = require("./page/generate-page");
      const createTwoColumnTemplate = require("./page/two-column-template");
      generatePage(createTwoColumnTemplate, "pages", args);
      break;
    }
    case "generate-list-page": {
      const generatePage = require("./page/generate-page");
      const createListTemplate = require("./page/list-template");
      generatePage(createListTemplate, "pages", args);
      break;
    }
    case "generate-recurring-billing": {
      const generateRecurringBilling = require("./billing/generate-recurring-billing");
      const transform = require("./transform");
      transform("server/server.js", generateRecurringBilling);
      break;
    }
    case "generate-one-time-billing": {
      const generateOneTimeCharge = require("./billing/generate-one-time-charge");
      const transform = require("./transform");
      transform("server/server.js", generateOneTimeCharge);
      break;
    }
    case "generate-webhook": {
      const type = args[3];
      const generateWebhook = require("./webhook/generate-webhook");
      const transform = require("./transform");
      transform("server/server.js", generateWebhook, type);
      break;
    }
    default:
      console.log("Please provide a command");
  }
}
receiveArgs(process.argv);
