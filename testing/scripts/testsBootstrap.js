const { start } = require('../../server');

let server = null;

module.exports = {
  // adding bootstrap/teardown
  async bootstrap() {
    server = await start(3000, true);
  },
  async teardown() {
    if (server) {
      server.close();
    }
  },
  // ...
  // other config options
};
