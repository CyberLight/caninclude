const { I } = inject();
const SearchForm = locate('form#search');
const QuickResultsSection = locate('table.quick-results__table').after(
  locate('.quick-results__header').withText('Quick Results'),
);
const MostLikedSection = locate('table.quick-results__table').after(
  locate('.quick-results__header').withText('Most liked'),
);
const MostDislikedSection = locate('table.quick-results__table').after(
  locate('.quick-results__header').withText('Most disliked'),
);

module.exports = {
  labels: {
    head: locate('h2.head').inside('form#search'),
    quickResults: locate('h2.quick-results__header').inside('section.about__quick-results'),
    swap: locate('label.swap').inside(SearchForm),
  },
  tables: {
    head: locate('tr.table__head').inside('table.quick-results__table'),
    rows: locate('tr.table__row').inside('table.quick-results__table'),
    quickResultsRows: locate('tr.table__row').inside(QuickResultsSection),
    quickResultsHead: locate('tr.table__head').inside(QuickResultsSection),
    mostLikedRows: locate('tr.table__row').inside(MostLikedSection),
    mostDislikedRows: locate('tr.table__row').inside(MostDislikedSection),
    row(index) {
      return locate(this.rows).at(index);
    },
    resultLink(index) {
      return locate('a.table__link').at(index);
    },
  },
  decoration: {
    lightRope: locate('ul.lightrope'),
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
  helpers: {
    getLastRow(rows, addValues = []) {
      return rows.slice(-1).map((r) => (
        [r.child, r.parent, r.canInclude, String(r.count), ...addValues]
      ));
    },
  },
  // insert your locators and methods here
};
