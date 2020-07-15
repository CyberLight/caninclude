module.exports = {
    ci: {
        collect: {
            url: [
                "http://localhost:3000/",
                "http://localhost:3000/can/include/?child=h2&parent=button",
            ]
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
            serverBaseUrl: process.env.LHI_URL,
            token: process.env.LHI_BUILD_TOKEN
        },
    },
};