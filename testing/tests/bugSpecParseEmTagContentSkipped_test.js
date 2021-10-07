const { DetailPage } = inject();
const expectedScreenshotFileName = 'input_button_left_section.png';

Feature('#77 bug spec parse em tag content skipped');

Scenario('tag EM included as text for Input tag sections', ({ I }) => {
  DetailPage.amOnPage('input', 'button');
  I.saveElementScreenshot(DetailPage.sections.left, expectedScreenshotFileName);
  I.seeVisualDiffForElement(DetailPage.sections.left, expectedScreenshotFileName, {
    tolerance: 0,
    prepareBaseImage: false,
    scaleToSameSize: true,
    ignore: 'antialiasing',
  });
});
