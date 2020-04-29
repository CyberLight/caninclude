const { html, Component } = require('htm/preact');

class About extends Component {
    render({ children, show }) {
        return show && html`
           <div class="about"> 
            ${children}
           </div>`;
    }
}

module.exports = About;