// eslint-disable-next-line import/no-extraneous-dependencies
const Helper = require('@codeceptjs/helper');
const { setEnv } = require('../../server');

class EnvHelper extends Helper {
  // before/after hooks
  /**
   * @protected
   */
  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _before() {
    // remove if not used
  }

  /**
   * @protected
   */
  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _after() {
    // remove if not used
  }

  // add custom methods here
  // If you need to access other helpers
  // use: this.helpers['helperName']

  // eslint-disable-next-line class-methods-use-this
  async amSettingAnEnvVariable(name, value) {
    setEnv(name, value);
  }
}

module.exports = EnvHelper;
