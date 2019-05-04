const generatePage = require('./generate-page');
const addMiddleware = require('./add-middleware');


function receiveArgs() {
  const type = process.argv[2];
  switch (type) {
    case 'generate-page':
      generatePage('pages', process.argv);
      break;
    case 'add-billing':
      addMiddleware('server/server.js', 'foo');
      break
    default:
      console.log('Please provide a command');
  }
}
receiveArgs();
