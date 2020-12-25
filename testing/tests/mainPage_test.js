const { MainPage } = inject();

Feature('mainPage');

Scenario('First page visit', async ({ I }) => {
  I.amOnPage('/');
  I.seeTextEquals('Can I Include*', MainPage.labels.head);
  I.seeTextEquals('Last 0 Quick Results', MainPage.labels.quickResults);
  I.seeNumberOfVisibleElements(MainPage.tables.rows, 0);
  await I.checkTableColumnNames(MainPage.tables.head, ['Child', 'Parent', 'Can Include?', 'Count', 'Link to']);
  await I.checkRequestsCounterValues(MainPage.counters.requests, `Counter: 1 req | 1 uniq | ${new Date().toJSON().slice(0, 10)}`);
}).tag('@db');

Scenario('Counter incrementation', async ({ I }) => {
  I.amOnPage('/');
  await I.checkRequestsCounterValues(MainPage.counters.requests, `Counter: 1 req | 1 uniq | ${new Date().toJSON().slice(0, 10)}`);
  I.refreshPage();
  await I.checkRequestsCounterValues(MainPage.counters.requests, `Counter: 2 req | 1 uniq | ${new Date().toJSON().slice(0, 10)}`);
  I.refreshPage();
  await I.checkRequestsCounterValues(MainPage.counters.requests, `Counter: 3 req | 1 uniq | ${new Date().toJSON().slice(0, 10)}`);
}).tag('@db');
