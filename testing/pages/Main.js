// const { I } = inject();

module.exports = {
  labels: {
    head: locate('h2.head').inside('form#search'),
    quickResults: locate('h2.quick-results__header').inside('section.about__quick-results'),
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
  // insert your locators and methods here
};
