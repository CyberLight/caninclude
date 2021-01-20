const { MainPage, DataTables } = inject();

Feature('mainPage');

Scenario('First page visit', async ({ I }) => {
  I.amOnPage('/');
  I.seeTextEquals('Can I Include*', MainPage.labels.head);
  await I.checkAllLabels(MainPage.labels.quickResults, ['Last 0 Most liked', 'Last 0 Quick Results', 'Last 0 Most disliked']);
  I.seeNumberOfVisibleElements(MainPage.tables.quickResultsRows, 0);
  await I.checkTableColumnNames(MainPage.tables.quickResultsHead, ['Child', 'Parent', 'Can Include?', 'Count', 'Link to']);
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

const dataTable1 = DataTables.likes.likesTable;
dataTable1.add('One like');
dataTable1.add('More than one like');
dataTable1.add('Equal count of likes and dislikes');
dataTable1.add('No likes');

Data(dataTable1)
  .Scenario('Most liked table', async ({ I, current }) => {
    I.haveLikeItemsInDb(current.actualRows);
    MainPage.amOnPage();
    I.seeNumberOfVisibleElements(MainPage.tables.mostLikedRows, current.expectedCountRows);
    await I.checkTableRow(MainPage.tables.mostLikedRows, current.expectedRows);
  }).tag('@db');

const dataTable2 = DataTables.likes.dislikesTable;
dataTable2.add('One dislike');
dataTable2.add('More than one dislike');
dataTable2.add('Equal count of likes and dislikes');
dataTable2.add('No dislikes');

Data(dataTable2)
  .Scenario('Most disliked table', async ({ I, current }) => {
    I.haveLikeItemsInDb(current.actualRows);
    MainPage.amOnPage();
    I.seeNumberOfVisibleElements(MainPage.tables.mostDislikedRows, current.expectedCountRows);
    await I.checkTableRow(MainPage.tables.mostDislikedRows, current.expectedRows);
  }).tag('@db');
