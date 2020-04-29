const { html, Component } = require('htm/preact');

class ResultSection extends Component {
    getIconClass(props) {
        if (props['success']) {
            return 'section-result__icon--success';
        } else if (props['fail']) {
            return 'section-result__icon--fail';
        } else if (props['doubt']) {
            return 'section-result__icon--doubt';
        }
        return 'section-result__icon--unknown';
    }

    getSectionClass(props) {
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
        <section class="tag__section-result ${this.getSectionClass(props)}">
            <div class="section-result__icon ${this.getIconClass(props)}"></div>
            <div class="section-result__text">${props.text}</div>
        </section>`;
    }
}

module.exports = ResultSection;