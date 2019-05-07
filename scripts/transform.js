const fs = require('fs');
const parser = require('@babel/parser').parse;
const generate = require('@babel/generator').default;
const prettier = require('prettier');

const transform = (fileToWrite, transformer) => {
  const fileLocation = fileToWrite
  const file = fs.readFileSync(fileLocation).toString();
  const ast = parser(file, { sourceType: 'module' });
  const newCode = generate(transformer(ast)).code

  const prettifiedCode = prettier.format(newCode, { parser: 'babel' })
  fs.writeFile(fileToWrite, prettifiedCode, (err) => {
    if (err) throw new Error(`${err}`)
    console.log(`Scaffold was successfully added to ${fileToWrite}!`)
  });

};

module.exports = transform;
