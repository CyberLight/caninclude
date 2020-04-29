const { html, Component } = require('htm/preact');

class ColorText extends Component {
    render({ children }) {
        const colors = ['char-red', 'char-green', 'char-yellow'];
        return children.split('').map((ch, index) => html`<span class="${colors[index % 3]}">${ch}</span>`);
    }
}

module.exports = ColorText;