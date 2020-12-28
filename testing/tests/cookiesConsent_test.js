const { MainPage, CommonPage } = inject();

Feature('Cookies consent dialog');

Scenario('Show dialog for users who have not clicked the "accept" button', ({ I }) => {
  MainPage.amOnPage();
  I.dontSeeCookie();
  I.refreshPage();
  I.seeElementInDOM(CommonPage.dialogs.cookieConsent);
});

Scenario('Don\'t show dialog for users who clicked the "accept" button', async ({ I }) => {
  MainPage.amOnPage();
  I.dontSeeCookie();
  I.click(CommonPage.buttons.acceptCookieContent);
  I.dontSeeElementInDOM(CommonPage.dialogs.cookieConsent);
  await I.checkSessionCookieContent();
});
