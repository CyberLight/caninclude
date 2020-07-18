const { html, Component } = require('htm/preact');
const SwapButton = require('./SwapButton');

class SearchForm extends Component {
    render({ parent = '', child = '', show = true }) {
        return show && html`
        <section class="search">
            <h1 class="search__title">Check when a tag can be included in another tag</h1>
            
            <form id="search" autocomplete="off" class="search__form" action="/can/include/" method="get">
                <div class="form__content">
                    <h2 class="head"><a class="head__link--regular" href="/">Can I include</a></h2>
                    <input autofocus aria-label="Child tag name" type="text" id="child" name="child" autocomplete="off" placeholder="Child tag name" value="${child.toLowerCase()}"/>
                    <${SwapButton}/>
                    <input type="text" aria-label="Parent tag name" id="parent" name="parent" autocomplete="off" placeholder="Parent tag name" value="${parent.toLowerCase()}"/>
                    <button class="search__button search__button--accent" aria-label="Submit tag names" type="submit">?</button>
                </div>
            </form>
            
        </section>`;
    }
}

module.exports = SearchForm;