const fs = require('fs');

/* generates a file in the pages folder, usage:
  npm run-script generate-page <handle>
*/

function generatePage(dir, args) {
  const handle = args[3]
  const page = `${dir}/${handle}.js`;
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
