const { html, Component } = require('htm/preact');
const TagItems = require('./TagItems');
const Support = require('./Support');

class Section extends Component {
    render({ tag, accent }) {
        return tag && html`
        <section class="tag__section">
            <a href="${tag.tags.href}" class="tag__name">${tag.tags.list.map(item => `<${item}/>`).join(', ')}</a>
            <div class="tag__items tag__items--major ${accent === 'first' ? 'tag__items--accent' : ''}">
                <p class="tag__head">Categories</p>
                <${TagItems} items="${tag.props.Categories}"></${TagItems}>
            </div>
            <div class="tag__items tag__items--minor">
                <p class="tag__head">Contexts in which this element can be used</p>
                <${TagItems} items="${tag.props.ContextsInWhichThisElementCanBeUsed}"></${TagItems}>
            </div>  
            <div class="tag__items tag__items--major ${accent === 'last' ? 'tag__items--accent' : ''}">  
                <p class="tag__head">Content model</p>
                <${TagItems} items="${tag.props.ContentModel}"></${TagItems}>
            </div>  
            <${Support} data="${tag.support}"/>
        </section>`;
    }
}

module.exports = Section;