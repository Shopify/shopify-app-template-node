function receiveArgs(args) {
  const type = args[2];
  switch (type) {
    case "generate-page": {
      const generatePage = require("./generate-page");
      generatePage("pages", args);
      break;
    }
    case "generate-recurring-billing": {
      const generateRecurringBilling = require("./generate-recurring-billing");
      const transform = require("./transform");
      transform("server/server.js", generateRecurringBilling);
      break;
    }
    case "generate-one-time-billing": {
      const generateOneTimeCharge = require("./generate-one-time-charge");
      const transform = require("./transform");
      transform("server/server.js", generateOneTimeCharge);
      break;
    }
    case "generate-webhooks": {
      const type = args[3].toString();
      const url = args[4].toString();
      const generateWebhooks = require("./generate-webhooks");
      const transform = require("./transform");
      transform("server/server.js", generateWebhooks, type, url);
      break;
    }
    default:
      console.log("Please provide a command");
  }
}
receiveArgs(process.argv);
