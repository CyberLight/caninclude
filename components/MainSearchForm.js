const { html, Component } = require('htm/preact');
const ColorText = require('./ColorText');

class MainSearchForm extends Component {
    render({ parent = '', child = '', show = true }) {
        return show && html`
        <section class="search">
            <form id="search" autocomplete="off" class="search__form" action="/can/include/" method="get">
                <label class="head head--big" for="child"><${ColorText}>Can I Include*</${ColorText}></label><br/>
                <div class="search__container">
                    <input type="search" id="child" name="child" autocomplete="off" placeholder="Child tag name" value="${child.toLowerCase()}"/>
                    <label class="divider">to</label>
                    <input type="search" id="parent" name="parent" autocomplete="off" placeholder="Parent tag name" value="${parent.toLowerCase()}"/>
                    <button class="search__button" type="submit">?</button>
                </div>
            </form>
        </section>`;
    }
}

module.exports = MainSearchForm;