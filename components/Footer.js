const { html, Component } = require('htm/preact');
const { shortenNumber } = require('../utils');

class Footer extends Component {
    render({ count, uniqCount }) {
        const thanksTo = [
            { href: 'https://caniuse.com', text: 'Can I Use' },
            { href: 'https://html.spec.whatwg.org', text: 'HTML Spec WHATWG' },
            { href: 'https://developer.mozilla.org', text: 'MDN' },
        ]

        return html`
            <footer class="footer">
                <div>
                    <p>
                        Special <b>thanks</b> to: ${thanksTo.map(link => 
                            html`<a target="_blank" rel="noopener noreferrer" class="footer__link" href="${link.href}" target="_blank" rel="noopener noreferrer">${link.text}</a>, `)}
                    </p>
                    <p>
                        <b>Built</b> by <a target="_blank" rel="noopener noreferrer" class="footer__link" href="https://github.com/CyberLight/" target="_blank" rel="noopener noreferrer">@CyberLight</a> a lone developer.
                    </p>
                    <p>Counter: ${shortenNumber(count)} req | ${shortenNumber(uniqCount)} uniq | ${new Date().toJSON().slice(0, 10)}</p>
                </div>
            </footer>`;
    }
}

module.exports = Footer;