const fs = require('fs');

function createFile() {
  const page = `pages/${process.argv[2]}`;
  const content = process.argv[3] ? process.argv[3] : '<div>content</div>'
  if (fs.existsSync(page)) {
    console.log(`${page} already exists`)
  }
  else {
    fs.writeFile(page, content, (err) => {
      if (err) throw err;
      console.log(`${page} was succesfully saved!`);
    });
  };
};

createFile();

