const { html, Component } = require('htm/preact');
const SwapButton = require('./SwapButton');

class SearchForm extends Component {
    render({ parent = '', child = '', show = true }) {
        return show && html`
        <section class="search">
            <h1 class="search__title">Check when a tag can be included in another tag</h1>
            
            <form id="search" autocomplete="off" class="search__form" action="/can/include/" method="get">
                <div class="form__content">
                    <label class="head" for="child"><a class="head__link--regular" href="/">Can I include</a></label>
                    <input type="text" id="child" name="child" autocomplete="off" placeholder="Child tag name" value="${child.toLowerCase()}"/>
                    <${SwapButton}/>
                    <input type="text" id="parent" name="parent" autocomplete="off" placeholder="Parent tag name" value="${parent.toLowerCase()}"/>
                    <button class="search__button search__button--accent" type="submit">?</button>
                </div>
            </form>
            
        </section>`;
    }
}

module.exports = SearchForm;