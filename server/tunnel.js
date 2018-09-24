/* eslint-disable no-console */
const ngrok = require('ngrok');
const {writeFileSync, unlinkSync} = require('fs-extra');
const {port, tunnelFile} = require('../config/server');

(async function() {
  let url;

  try {
    url = await ngrok.connect(port);
    writeFileSync(tunnelFile, url);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`Port ${port} not open, ngrok is probably running elsewhere`);
      return;
    } else {
      console.log(error);
    }
  }

  console.log(`Tunnel open to ${url}`);
  console.log(`Be sure to add ${url}/auth/callback to the whitelisted redirection URLs in Partners Dashboard under App Setup.`);

  function close() {
    unlinkSync(tunnelFile);
    console.log('closing');
  }

  process.on('exit', close);
  process.on('SIGINT', close);
})();
