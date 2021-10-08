const { DetailPage } = inject();

Feature('#77 bug spec parse em tag content skipped');

Scenario('tag EM included as text for Input tag sections', () => {
  DetailPage.amOnPage('input', 'button');
  DetailPage.seeTextInTheCategorySection(
    `Categories

Flow content.
Phrasing content.
If the type attribute is not in the Hidden state: Interactive content.
If the type attribute is not in the Hidden state: Listed, labelable, submittable, resettable, and autocapitalize-inheriting form-associated element.
If the type attribute is in the Hidden state: Listed, submittable, resettable, and autocapitalize-inheriting form-associated element.
If the type attribute is not in the Hidden state: Palpable content.`,
  );
});
