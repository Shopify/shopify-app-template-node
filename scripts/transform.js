const fs = require("fs");
const parser = require("@babel/parser").parse;
const generate = require("@babel/generator").default;
const prettier = require("prettier");

const transform = (fileToWrite, transformer, type) => {
  const file = fs.readFileSync(fileToWrite).toString();
  const ast = parser(file, { sourceType: "module" });
  const newCode = generate(transformer(ast, type)).code;
  const prettifiedCode = prettier.format(newCode, { parser: "babel" });
  fs.writeFileSync(fileToWrite, prettifiedCode, err => {
    if (err) throw new Error(`${err}`);
    console.log(`Scaffold was successfully added to ${fileToWrite}!`);
  });
};

module.exports = transform;
