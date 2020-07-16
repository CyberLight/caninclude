const settings = require('./lhci_settings.json');

module.exports = {
    ci: {
        collect: {
            url: [
                "http://localhost:3000/",
                "http://localhost:3000/can/include/?child=h2&parent=button",
            ],
            settings: {
                chromeFlags: "--disable-gpu --no-sandbox --disable-setuid-sandbox"
            }
        },
        assert: {
            preset: "lighthouse:no-pwa",
            assertions: {
                "dom-size": ["error", { "maxNumericValue": 3000 }],
                "offscreen-images": "off",
                "color-contrast": "off",
                "tap-targets": "off"
            },
        },
        upload: {
            target: 'lhci',
            serverBaseUrl: settings.serverBaseUrl,
            token: settings.token
        },
    },
};