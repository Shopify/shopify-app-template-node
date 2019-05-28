const { toPascalCase } = require("./utilities");
const fs = require("fs");
/* generates a file in the pages folder, usage:
  npm run-script generate-page <handle>
*/

function generatePage(dir, args) {
  const handle = args[3];
  const page = `${dir}/${handle}.js`;
  const componentName = toPascalCase(handle);
  const content = `const ${componentName} = () => <div>${componentName}</div>;\nexport default ${componentName};`;
  if (fs.existsSync(page)) {
    console.log(`${page} already exists`);
  } else {
    fs.writeFileSync(page, content, err => {
      if (err) throw err;
      console.log(`${page} was successfully created!`);
    });
  }
}

module.exports = generatePage;
