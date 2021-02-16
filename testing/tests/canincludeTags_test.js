const { DetailPage, DataTables } = inject();

Feature('canincludeTags');

const dataTable1 = DataTables.history.tagPairs;
dataTable1.add('img inside button');
dataTable1.add('a inside a');
dataTable1.add('a inside label');
dataTable1.add('img inside a');
dataTable1.add('label inside a');

Data(dataTable1)
  .Scenario('Check posibility to include one tag to another', ({ I, current }) => {
    const { child, parent, resultSectionImg } = current;
    DetailPage.amOnPage(child, parent);
    I.saveElementScreenshot(DetailPage.sections.result, resultSectionImg);
    I.seeVisualDiff(resultSectionImg, { tolerance: 0, prepareBaseImage: false });
  });
