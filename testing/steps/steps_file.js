// in this file you can append custom step methods to 'I' object
// eslint-disable-next-line import/no-extraneous-dependencies
const expect = require('expect');

module.exports = function customSteps() {
  // eslint-disable-next-line no-undef
  return actor({

    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.
    async checkTableColumnNames(headLocator, expected) {
      const headColumnNames = await this.grabTextFromAll(headLocator).then((row) => row.map((s) => s.split('\t'))).then((result) => result[0]);
      expect(headColumnNames).toStrictEqual(expected);
    },
    async checkRequestsCounterValues(locator, expected) {
      const locatorText = await this.grabTextFrom(locator);
      expect(locatorText).toStrictEqual(expected);
    },
    async checkTableRow(rowLocator, expected) {
      const actualRowValues = await this.grabTextFromAll(rowLocator).then((row) => row.map((s) => s.split('\t')));
      expect(actualRowValues).toStrictEqual(expected);
    },
  });
};
