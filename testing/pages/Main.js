const { I } = inject();
const SearchForm = locate('form#search');

module.exports = {
  labels: {
    head: locate('h2.head').inside('form#search'),
    quickResults: locate('h2.quick-results__header').inside('section.about__quick-results'),
    swap: locate('label.swap').inside(SearchForm),
  },
  tables: {
    head: locate('tr.table__head').inside('table.quick-results__table'),
    rows: locate('tr.table__row').inside('table.quick-results__table'),
    row(index) {
      return locate(this.rows).at(index);
    },
  },
  counters: {
    requests: locate('p.counter').inside('footer'),
  },
  inputs: {
    child: locate('input[name="child"]').inside(SearchForm),
    parent: locate('input[name="parent"]').inside(SearchForm),
    swap: locate('input[name="swap"]').inside(SearchForm),
  },
  buttons: {
    submit: locate('button[type="submit"]').inside(SearchForm),
  },
  amOnPage() {
    I.amOnPage('/');
    I.waitForVisible(this.labels.head);
    I.seeTextEquals('Can I Include*', this.labels.head);
  },
  fillForm(options) {
    const { swap, ...other } = options;
    I.fillField(this.inputs.child, other.child);
    I.seeInField(this.inputs.child, other.child);
    I.fillField(this.inputs.parent, other.parent);
    I.seeInField(this.inputs.parent, other.parent);
    if (swap) {
      I.click(this.labels.swap);
    }
  },
  // insert your locators and methods here
};
