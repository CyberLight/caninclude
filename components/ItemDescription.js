const { html, Component } = require('htm/preact');

class ItemDescription extends Component {
    render({ content }) {
        return html`
        <span>
            <strong>Description: </strong>
            ${content}
        </span>`;
    }
}

module.exports = ItemDescription;