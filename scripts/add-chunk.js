// const readline = require('readline');
// const fs = require('fs');

// const myInterface = readline.createInterface({
//   input: fs.createReadStream('server/server.js')
// });

// let lineno = 0;
// myInterface.on('line', function(line) {
//   lineno++;
//   console.log('Line number ' + lineno + ': ' + line);
// });

const fs = require('fs');

const text = '  test test'

function append(line) {
  let body = fs.readFileSync('server/server.js').toString();
  body = body.split('\n');
  body.splice(line - 1, 0, text);
  const output = body.join('\n');
  fs.writeFileSync('server/server.js', output);
}

append(36);
