const { html, Component } = require('htm/preact');

class Tags extends Component {
    render({ children }) {
        return html`
           <div class="tag"> 
            ${children}
           </div>`;
    }
}

module.exports = Tags;