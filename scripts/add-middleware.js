const fs = require('fs');
const parser = require('@babel/parser').parse;
const parseExpression = require('@babel/parser').parseExpression;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const prettier = require('prettier');
const get = require('lodash/get');

const addMiddleware = (fileToWrite, middleware) => {
  const fileLocation = fileToWrite
  const file = fs.readFileSync(fileLocation).toString();
  const ast = parser(file, { sourceType: 'module' });

  let lastServer;
  let sessionAssignment;

  // Traverse the AST to find the nodes we need.
  traverse(ast, {

    // ExpressionStatement(path) {
    //   const object = get(path, ['node', 'expression', 'callee', 'object', 'name'], '')
    //   const property = get(path, ['node', 'expression', 'callee', 'property', 'name'], '')
    //   if (
    //     object === 'server' && property === 'use'
    //   ) {
    //     lastServer = path;
    //   }
    // },

    // ExpressionStatement(path) {
    //   const variableinAuth = get(path, ['node', 'expression', 'callee', 'type'])
    //   console.log(variableinAuth)
    // }

    VariableDeclaration(path) {
      const variableInAuth = get(path, ['node', 'declarations'])[0]
      const properties = get(variableInAuth, ['id', 'properties'])
      if (properties) {
        properties.filter((prop) => {
          return get(prop, ['key', 'name']) == 'shop';
        });
        sessionAssignment = variableInAuth;
      }
      console.log(sessionAssignment);
    }
  })

  const code = middleware
  sessionAssignment.insertAfter(parseExpression(code));

  const newCode = generate(ast).code

  const prettifiedCode = prettier.format(newCode, { parser: 'babel' })
  fs.writeFile('transformed.js', prettifiedCode, (err) => {
    if (err) throw new Error(`${err}`)
    console.log(`Billing scaffold was successfully added to ${fileToWrite}!`)
  });
};

module.exports = addMiddleware;
