const { html, Component } = require('htm/preact');

class HeaderTips extends Component {
  // eslint-disable-next-line class-methods-use-this
  render({ content }) {
    return (content && html`<div class="header-tips" dangerouslySetInnerHTML="${{ __html: content }}"/>`) || null;
  }
}

module.exports = HeaderTips;
