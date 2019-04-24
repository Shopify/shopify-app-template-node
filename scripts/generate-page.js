const fs = require('fs');

/* generates a file in the pages folder, usage:
  npm run-script generate-page <handle>
*/

function generatePage(arrayOfCommands) {
  const handle = arrayOfCommands[3]
  const page = `pages/${handle}.js`;
  const componentName = handle.replace(/\w/, c => c.toUpperCase())
  const content = `const ${componentName} = () => <div>content</div>;\nexport default ${componentName};`
  if (fs.existsSync(page)) {
    console.log(`${page} already exists`)
  }
  else {
    fs.writeFile(page, content, (err) => {
      if (err) throw err;
      console.log(`${page} was successfully created!`);
    });
  };
};

module.exports = generatePage;
