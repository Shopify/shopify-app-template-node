/* eslint-env node */
/* eslint-disable no-process-env */

const dev = process.env.NODE_ENV !== 'production';
const ip = process.env.IP || 'localhost';
const port = process.env.PORT || '8081';

const tunnelFile = 'config/tunnel.pid';

module.exports = {
  ip,
  port,
  tunnelFile,
  dev,
};
