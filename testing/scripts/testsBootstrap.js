const { start } = require('../../server');

let stop = null;

module.exports = {
  // adding bootstrap/teardown
  async bootstrap() {
    stop = await start(3000, true);
  },
  async teardown() {
    if (typeof stop === 'function') {
      await stop();
    }
  },
  // ...
  // other config options
};
