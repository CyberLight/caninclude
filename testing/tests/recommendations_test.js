const { DetailPage, DataTables } = inject();

Feature('recommendations');

const dataTable1 = DataTables.history.recommendationsByParentTag;
dataTable1.add('Recommends most viewed at the same created date');
dataTable1.add('Recommends most viewd tag but older');

Data(dataTable1)
  .Scenario('Recommendation for parent tag of requested tags pair by "created" and "count" fields', ({ I, current }) => {
    const { historyItems, recommendationText } = current;
    I.haveHistoryItemsInDb(historyItems);
    DetailPage.amOnPage('b', 'span');
    DetailPage.seeRecommendationText(recommendationText);
  }).tag('@db');
