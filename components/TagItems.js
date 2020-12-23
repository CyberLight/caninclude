const { html, Component } = require('htm/preact');
const TagItem = require('./TagItem');

class TagItems extends Component {
  // eslint-disable-next-line class-methods-use-this
  render({ items }) {
    return html`
            <ul>
                ${items.map((item) => html`<${TagItem} item="${item}"></${TagItem}>`)}
            </ul>`;
  }
}

module.exports = TagItems;
