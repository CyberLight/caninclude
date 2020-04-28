const { html, Component } = require('htm/preact');

class ResultSection extends Component {
    getClass(props) {
        if (props['success']) {
            return 'tag__section-result--success';
        } else if (props['fail']) {
            return 'tag__section-result--fail';
        } else if (props['doubt']) {
            return 'tag__section-result--doubt';
        }
        return 'tag__section-result--unknown';
    }
    render(props) {
        return html`
        <section class="tag__section-result ${this.getClass(props)}">
        </section>`;
    }
}

module.exports = ResultSection;