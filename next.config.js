const withCSS = require("@zeit/next-css");
const dotenvLoad = require("dotenv-load");

dotenvLoad();
module.exports = withCSS();
