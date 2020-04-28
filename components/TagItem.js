const { html, Component } = require('htm/preact');

class TagItem extends Component {
    renderItem(item) {
        const sorted = item.keywords.sort((l,r) => l.text.length - r.text.length);
        const content = sorted.reduce((text, keyWord) => 
            text.replace(new RegExp(`\\b(${keyWord.text})\\b`, 'g'), `<a class="tag__link" href="${keyWord.href}">$1</a>`),
            item.textContent
        );
        
        return html`<li class="tag__item" dangerouslySetInnerHTML="${{ __html: content }}"/>`
    }

    render({ item }) {
        return item && this.renderItem(item);
    }
}

module.exports = TagItem;