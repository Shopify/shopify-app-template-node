/* eslint-env node */
/* eslint-disable no-process-env */

// localhost:8081 is the sewing-kit default for dev server
const ip = process.env.IP || 'localhost';
const port = process.env.PORT || '8081';

// localhost:8080 is the sewing-kit default build server
const cdnUrl = process.env.CDN_URL || '/webpack/assets/';

// where vendor.js is build to
const vendorBundleUrl = `${cdnUrl}dll/vendor.js`;

const tunnelFile = 'config/tunnel.pid';

module.exports = {
  ip,
  port,
  cdnUrl,
  vendorBundleUrl,
  tunnelFile,
};
