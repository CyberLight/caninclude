const { I } = inject();

module.exports = {
  // insert your locators and methods here
  labels: {
    head: locate('h2.head').inside('header'),
    recommendText: locate('.recommends__text').inside('.recommends'),
  },
  sections: {
    result: locate('div.section-result__container'),
    left: locate('section.tag__section').at(1),
  },
  amOnPage(child, parent) {
    I.amOnPage(`/can/include?child=${child}&parent=${parent}`);
    I.waitForVisible(this.labels.head);
    I.seeTextEquals('Can I include', this.labels.head);
  },

  seeRecommendationText(text) {
    I.seeTextEquals(text, this.labels.recommendText);
  },

  seeTextInTheCategorySection(text, location = 'left') {
    I.seeTextEquals(text, this.sections[location].find(locate('div.tag__items')).at(1));
  },
};
