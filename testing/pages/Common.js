// const { I } = inject();

const CookieConsentDialogLocator = locate('div[class="cookie-consent"]');

module.exports = {
  helpers: {
    detailUrl(item) {
      return `/can/include/?child=${item.child}&parent=${item.parent}`;
    },
  },
  buttons: {
    acceptCookieContent: locate('a[class="cookie-consent__accept-button"]').inside(CookieConsentDialogLocator),
  },
  dialogs: {
    cookieConsent: CookieConsentDialogLocator.withChild(
      locate('a[class="cookie-consent__accept-button"]').withText('Accept'),
    ),
  },
  // insert your locators and methods here
};
