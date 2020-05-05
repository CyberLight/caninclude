const { html, Component } = require('htm/preact');

class CookieConsent extends Component {
    render() {
        return html`
        <div class="cookie-consent">
            This site uses cookies to evaluate the quality of the result of determining whether a tag can be included in a tag. <br/> By accepting the use of cookies, you can vote “like” or “dislike”.
            <a class="cookie-consent__accept-button" href="/cookies/accept">
                <span class="accept-button__inner">
                    Accept
                </span>
            </a>
        </div>`;
    }
}

module.exports = CookieConsent;