const generatePage = require('./generate-page');
const addMiddleware = require('./add-billing');


function receiveArgs() {
  const type = process.argv[2];
  switch (type) {
    case 'generate-page':
      generatePage('pages', process.argv);
      break;
    case 'add-recurring-billing':
      addMiddleware('server/server.js', "await callBilling(ctx, 'recurring')");
      break
    case 'add-one-time-billing':
      addMiddleware('server/server.js', "callBilling(ctx, 'one time')");
      break
    default:
      console.log('Please provide a command');
  }
}
receiveArgs();
