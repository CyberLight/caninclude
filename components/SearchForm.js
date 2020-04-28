const { html, Component } = require('htm/preact');

class SearchForm extends Component {
    render({ parent = '', child = '' }) {
        return html`
        <section class="search">
            <form id="search" class="search__form" action="/can/include/" method="get">
                <label class="head" for="child">Can I include</label>
                <input type="text" id="child" name="child" placeholder="Parent tag name" value="${child}"/>
                <span class="divider">to</span>
                <input type="text" id="parent" name="parent" placeholder="Child tag name" value="${parent}"/>
                <button class="search__button" type="submit">?</button>
            </form>
        </section>`;
    }
}

module.exports = SearchForm;