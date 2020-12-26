const { MainPage } = inject();

Feature('forms');

const formDataTable = new DataTable(['child', 'swap', 'parent', 'expectedUrl']);
formDataTable.add(['div', false, 'section', '/can/include/?child=div&parent=section']);
formDataTable.add(['div', true, 'section', '/can/include/?child=div&swap=on&parent=section']);

Data(formDataTable)
  .Scenario('Main page sending form with swap and without', ({ I, current }) => {
    MainPage.amOnPage();
    MainPage.fillForm({ child: current.child, parent: current.parent, swap: current.swap });
    I.click(MainPage.buttons.submit);
    I.seeInCurrentUrl(current.expectedUrl);
  });
