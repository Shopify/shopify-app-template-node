const fs = require("fs");
/* generates a file in the pages folder, usage:
  npm run-script generate-page <handle>
*/

function generatePage(type, dir, args) {
  const handle = args[3];
  const page = `${dir}/${handle.toLowerCase()}.js`;
  if (fs.existsSync(page)) {
    process.exitCode = 2;
  } else {
    fs.writeFileSync(page, type(handle), err => {
      if (err) process.exitCode = 1;
      console.log(`${page} was successfully created!`);
    });
  }
}

module.exports = generatePage;
