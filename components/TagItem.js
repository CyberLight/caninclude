const { html, Component } = require('htm/preact');

class TagItem extends Component {
  // eslint-disable-next-line class-methods-use-this
  renderItem(item) {
    const content = item.elements.map((element) => (
      typeof element === 'string'
        ? element : `<a target="_blank" rel="noopener noreferrer" class="tag__link" href="${
          element.href
        }">${element.text}</a>`),
    []).join('');

    return html`<li class="tag__item" dangerouslySetInnerHTML="${{ __html: content }}"/>`;
  }

  render({ item }) {
    return item && this.renderItem(item);
  }
}

module.exports = TagItem;
