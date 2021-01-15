// eslint-disable-next-line import/no-extraneous-dependencies
const { setHeadlessWhen } = require('@codeceptjs/configure');
const bootstrap = require('./testing/scripts/testsBootstrap');
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: './testing/tests/*_test.js',
  output: './testing/output',
  helpers: {
    Puppeteer: {
      url: 'http://localhost:3000',
      show: false,
      windowSize: '1200x900',
      waitForNavigation: 'networkidle0',
      chrome: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--disable-gpu',
          '--disable-component-update',
          '--disable-extensions',
          '--remote-debugging-address=0.0.0.0',
          '--remote-debugging-port=9222',
        ],
      },
      waitForTimeout: 1000,
    },
    DbHelper: {
      require: './testing/helpers/dbHelper.js',
    },
    ResembleHelper: {
      require: 'codeceptjs-resemblehelper',
      screenshotFolder: './testing/output/',
      baseFolder: './testing/screenshots/base/',
      diffFolder: './testing/screenshots/diff/',
    },
  },
  include: {
    I: './testing/steps/steps_file.js',
    MainPage: './testing/pages/Main.js',
    CommonPage: './testing/pages/Common.js',
    DetailPage: './testing/pages/Detail.js',
    DataTables: './testing/datatables/index.js',
  },
  // eslint-disable-next-line global-require
  bootstrap: bootstrap.bootstrap,
  teardown: bootstrap.teardown,
  mocha: {
    bail: true,
    reporterOptions: {
      mochaFile: 'testing/reports/result.xml',
    },
  },
  name: 'caninclude',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
      uniqueScreenshotNames: true,
      fullPageScreenshots: true,
    },
    dbPlugin: {
      enabled: true,
      require: './testing/plugins/dbPlugin.js',
    },
  },
};
