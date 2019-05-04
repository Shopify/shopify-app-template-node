const fs = require('fs');
const parser = require('@babel/parser').parse;
const parseExpression = require('@babel/parser').parseExpression;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const prettier = require('prettier');
const get = require('lodash/get');

const addMiddleware = (fileToWrite, line) => {
  const fileLocation = fileToWrite
  const file = fs.readFileSync(fileLocation).toString();
  const ast = parser(file, { sourceType: 'module' });
  let sessionAssignment;
  // Traverse the AST to find the nodes we need.
  traverse(ast, {
    VariableDeclaration(path) {
      const variableinAuth = get(path, ['node', 'declarations'])[0]
      const properties = get(variableinAuth, ['id', 'properties'])
      if (properties) {
        properties.filter((prop) => {
          return get(prop, ['key', 'name']) == 'shop';
        });
        sessionAssignment = path;
      }
    }
  })

  const code = line
  sessionAssignment.insertAfter(parser(code, { sourceType: 'module' }));

  const newCode = generate(ast).code

  const prettifiedCode = prettier.format(newCode, { parser: 'babel' })
  fs.writeFile('transformed.js', prettifiedCode, (err) => {
    if (err) throw new Error(`${err}`)
    console.log(`Billing scaffold was successfully added to ${fileToWrite}!`)
  });

};

module.exports = addMiddleware;
