const fs = require("fs");
const createPageTemplate = require("./page-template");
/* generates a file in the pages folder, usage:
  npm run-script generate-page <handle>
*/

function generatePage(dir, args) {
  const handle = args[3];
  const page = `${dir}/${handle.toLowerCase()}.js`;
  if (fs.existsSync(page)) {
    console.log(`${page} already exists`);
  } else {
    fs.writeFileSync(page, createPageTemplate(handle), err => {
      if (err) throw err;
      console.log(`${page} was successfully created!`);
    });
  }
}

module.exports = generatePage;
