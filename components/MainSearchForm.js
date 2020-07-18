const { html, Component } = require('htm/preact');
const ColorText = require('./ColorText');
const SwapButton = require('./SwapButton');

class MainSearchForm extends Component {
    render({ parent = '', child = '', show = true, specVersion }) {
        return show && html`
        <section class="search">
            <h1 class="search__title">Check when a tag can be included in another tag</h1>
            <form id="search" autocomplete="off" class="search__form" action="/can/include/" method="get">
                <h2 class="head head--big" aria-label="Can I Include?"><${ColorText}>Can I Include*</${ColorText}></h2>
                <p class="search__spec-version"><span class="head head--small">Based on HTML spec | Last Updated ${specVersion}</span></p><br/>
                <div class="search__container">
                    <input autofocus aria-label="Child tag name" type="text" id="child" name="child" autocomplete="off" placeholder="Child tag name" value="${child.toLowerCase()}"/>
                    <${SwapButton}/>
                    <input type="text" aria-label="Parent tag name" id="parent" name="parent" autocomplete="off" placeholder="Parent tag name" value="${parent.toLowerCase()}"/>
                    <button class="search__button search__button--accent" aria-label="Submit tag names" type="submit">?</button>
                </div>
            </form>
        </section>`;
    }
}

module.exports = MainSearchForm;