const { I } = inject();

module.exports = {
  // insert your locators and methods here
  labels: {
    head: locate('h2.head').inside('header'),
    recommendText: locate('.recommends__text').inside('.recommends'),
  },
  amOnPage(child, parent) {
    I.amOnPage(`/can/include?child=${child}&parent=${parent}`);
    I.waitForVisible(this.labels.head);
    I.seeTextEquals('Can I include', this.labels.head);
  },

  seeRecommendationText(text) {
    I.seeTextEquals(text, this.labels.recommendText);
  },
};
