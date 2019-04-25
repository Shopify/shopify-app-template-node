const generatePage = require('./generate-page');

function receiveArgs() {
  const type = process.argv[2];
  switch (type) {
    case 'generate-page':
      generatePage((dir = 'pages'), (args = process.argv));
      break;
    default:
      console.log('Please provide a command');
  }
}
receiveArgs();
