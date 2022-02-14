const path = require('path');
const fs = require('fs');

module.exports = function renderView(file, vars) {
  let content = fs.readFileSync(path.join(__dirname, 'views', `${file}.html`), {
    encoding: 'utf-8',
  });

  Object.keys(vars).forEach((key) => {
    const regexp = new RegExp(`{{ ${key} }}`, 'gm');
    content = content.replace(regexp, vars[key] || '');
  });

  return content;
};
