function receiveArgs(args) {
  const type = args[2];
  switch (type) {
    case "generate-page": {
      const generatePage = require("./page/generate-page");
      generatePage("pages", args);
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
