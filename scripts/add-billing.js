const fs = require('fs');
const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const prettier = require('prettier');
const get = require('lodash/get');

const addBilling = (fileToWrite, line) => {
  const fileLocation = fileToWrite
  const file = fs.readFileSync(fileLocation).toString();
  const ast = parser(file, { sourceType: 'module' });
  let redirectAfterAuth;
  // Traverse the AST to find the nodes we need.
  traverse(ast, {
    ExpressionStatement(path) {
      const getName = (get(path, ['node', 'expression', 'callee', 'object', 'name']))
      if (getName === 'ctx') {
        redirectAfterAuth = path;
      }
    }
  })

  const code = line
  redirectAfterAuth.replaceWith(parser(code, { sourceType: 'module', allowAwaitOutsideFunction: true }));

  const newCode = generate(ast).code

  const prettifiedCode = prettier.format(newCode, { parser: 'babel' })
  fs.writeFile('server/server.js', prettifiedCode, (err) => {
    if (err) throw new Error(`${err}`)
    console.log(`Billing scaffold was successfully added to ${fileToWrite}!`)
  });

};

module.exports = addBilling;
