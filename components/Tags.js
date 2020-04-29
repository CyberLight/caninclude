const { html, Component } = require('htm/preact');

class Tags extends Component {
    render({ children, show }) {
        return show && html`
           <div class="tag"> 
            ${children}
           </div>`;
    }
}

module.exports = Tags;