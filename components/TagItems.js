const { html, Component } = require('htm/preact');
const TagItem = require('./TagItem');
const ItemDescription = require('./ItemDescription');

class TagItems extends Component {
    renderDescription(content) {
        return content && html`<${ItemDescription} content="${content}"></${ItemDescription}>`
    }

    render({ items }) {
        return html`
            <ul>
                ${items.map(item => html`<${TagItem} item="${item}"></${TagItem}>`)}
            </ul>`;
    }
}

module.exports = TagItems;