const generatePage = require('./generate-page');

function receiveArgs() {
  const array = (process.argv)
  const type = process.argv[2]
  switch (type) {
    case 'generate-page':
      generatePage(array);
      break;
    default:
      console.log('please provide a command')
  }
}
receiveArgs();
