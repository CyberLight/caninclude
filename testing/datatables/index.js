const path = require('path');

const normalizedPath = path.join(__dirname, 'tables');

const allModules = {};

require('fs').readdirSync(normalizedPath).forEach((file) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  allModules[path.basename(file, path.extname(file))] = require(`./tables/${file}`);
});

module.exports = allModules;
