const { DataTableObject } = require('../types');

module.exports = {
  mainPageDecoration: new DataTableObject({
    'Main page decoration is turned on': {
      envName: 'MAIN_PAGE_DECORATION_TYPE',
      envValue: 'NY_LIGHT_RIBBON',
      shouldSeeDecoration: true,
    },
    'Main page decoration is turned off': {
      envName: 'MAIN_PAGE_DECORATION_TYPE',
      envValue: '',
      shouldSeeDecoration: false,
    },
  }),
};
