const { html, Component } = require('htm/preact');

class About extends Component {
  // eslint-disable-next-line class-methods-use-this
  render({ children, show }) {
    return show && html`
           <div class="about">
            ${children}
           </div>`;
  }
}

module.exports = About;
