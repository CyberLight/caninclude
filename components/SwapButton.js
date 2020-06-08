const { html, Component } = require('htm/preact');

class SwapButton extends Component {
    render(props) {
        return html`
            <label class="swap" ...${props}>
                <input class="swap__option" type="checkbox" name="swap"/>
                <span class="swap__icon"></span>
            </label>`;
    }
}

module.exports = SwapButton;