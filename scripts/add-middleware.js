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

  // Traverse the AST to find the nodes we need.
  traverse(ast, {
    //this works to find the last Server
    // ExpressionStatement(path) {
    //   const object = get(path, ['node', 'expression', 'callee', 'object', 'name'], '')
    //   const property = get(path, ['node', 'expression', 'callee', 'property', 'name'], '')
    //   if (
    //     object === 'server' && property === 'use'
    //   ) {
    //     lastServer = path;
    //   }
    // },

    ExpressionStatement(path) {
      const variableinAuth = get(path, ['node', 'expression', 'callee', 'type'])
      console.log(variableinAuth)
    }
  })

  // const code = middleware
  // lastServer.insertAfter(parseExpression(code));

  // const newCode = generate(ast).code

  // const prettifiedCode = prettier.format(newCode, { parser: 'babel' })
  // fs.writeFile('transformed.js', prettifiedCode, (err) => {
  //   if (err) throw new Error(`${err}`)
  //   console.log(`Billing scaffold was successfully added to ${fileToWrite}!`)
  // });
};

module.exports = addMiddleware;
