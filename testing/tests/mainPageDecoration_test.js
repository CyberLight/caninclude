const { MainPage, DataTables } = inject();

Feature('mainPageDecoration');

const dataTable1 = DataTables.decoration.mainPageDecoration;
dataTable1.add('Main page decoration is turned on');
dataTable1.add('Main page decoration is turned off');

Data(dataTable1)
  .Scenario('Turn on/off main page decoration', async ({ I, current }) => {
    const { shouldSeeDecoration, envName, envValue } = current;
    I.amSettingAnEnvVariable(envName, envValue);
    MainPage.amOnPage();
    if (shouldSeeDecoration) {
      I.seeElement(MainPage.decoration.lightRope);
    } else {
      I.dontSeeElement(MainPage.decoration.lightRope);
    }
  });
