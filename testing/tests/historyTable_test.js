const { MainPage } = inject();

Feature('mainPage > historyTable');

const quickItems = new DataTable(['item', 'image']);
quickItems.add([{ child: 'b', parent: 's', canInclude: 'yes' }, 'b_s_yes_history_single_row.png']);
quickItems.add([{ child: 'p', parent: 'ul', canInclude: 'no' }, 'p_ul_no_history_single_row.png']);
quickItems.add([{ child: 'img', parent: 'a', canInclude: 'doubt' }, 'img_a_doubt_single_history_row.png']);

Data(quickItems)
  .Scenario('10 quick results pair single item with different status yes|no|doubt', ({ I, current }) => {
    I.haveHistoryItemInDb(current.item);
    MainPage.amOnPage();
    I.saveElementScreenshot(MainPage.tables.row(1), current.image);
    I.seeVisualDiff(current.image, { tolerance: 0, prepareBaseImage: false });
  }).tag('@db');

Scenario('Max rows in last quick results table', async ({ I }) => {
  const MaxCountOfRows = 10;
  const rows = await I.haveANumberOfHistoryItemsInDb(20);
  MainPage.amOnPage();
  I.seeNumberOfVisibleElements(MainPage.tables.rows, MaxCountOfRows);
  await I.checkTableRow(MainPage.tables.row(1), MainPage.helpers.getLastRow(rows, ['result']));
}).tag('@db');
