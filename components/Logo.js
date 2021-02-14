const { html, Component } = require('htm/preact');
const ColorText = require('./ColorText');

class Logo extends Component {
  // eslint-disable-next-line class-methods-use-this
  render({ logoUrl, logoAlt }) {
    return (
      logoUrl && html`<img class="logo" aria-label="Can I Include?" alt="${logoAlt || 'logo'}" src="${logoUrl}"></img>`
    ) || html`<h2 class="head head--big" aria-label="Can I Include?"><${ColorText}>Can I Include*</${ColorText}></h2>`;
  }
}

module.exports = Logo;
