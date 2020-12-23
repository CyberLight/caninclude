const { html, Component } = require('htm/preact');

class Ribbon extends Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return html`<ul class="lightrope">
                  ${new Array(30).fill(0).map(() => html`<li></li>`)}
                </ul>`;
  }
}

module.exports = Ribbon;
