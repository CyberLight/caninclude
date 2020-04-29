const { html, Component } = require('htm/preact');

class SearchForm extends Component {
    render({ parent = '', child = '', show = true }) {
        return show && html`
        <section class="search">
            <form id="search" autocomplete="off" class="search__form" action="/can/include/" method="get">
                <label class="head" for="child"><a class="head__link--regular" href="/">Can I include</a></label>
                <input type="search" id="child" name="child" autocomplete="off" placeholder="Child tag name" value="${child}"/>
                <span class="divider">to</span>
                <input type="search" id="parent" name="parent" autocomplete="off" placeholder="Parent tag name" value="${parent}"/>
                <button class="search__button" type="submit">?</button>
            </form>
        </section>`;
    }
}

module.exports = SearchForm;