const { html, Component } = require('htm/preact');

class Tips extends Component {
    render({ tips = [] }) {
        return tips && tips.length && html`
           <div class="tip"> 
                <ul class="tip__item">
                    ${tips.map(tip => html`<li>${tip}</li>`)}
                </ul>
           </div>` || null;
    }
}

module.exports = Tips;