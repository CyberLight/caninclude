const { html, Component } = require('htm/preact');
const SearchForm = require('./SearchForm');
const Tags = require('./Tags');
const Section = require('./Section');
const ResultSection = require('./ResultSection');
const Footer = require('./Footer');

class App extends Component {
    render({ form, tags }) {
        return html`
        <div class="app">
            <header class="header">
                <${SearchForm} ...${form}/>
                <a class="header__marker" href="#">
                    <div class="marker__content">Alpha<br/>version</div>
                </a>
            </header>
            <main class="content">
                <${Tags}>
                    <${Section} tag="${tags[0]}" accent="first"/>
                    <${ResultSection} result="${tags[1]}"/>
                    <${Section} tag="${tags[2]}" accent="last"/>
                </${Tags}>
            </main>
            <${Footer}/>
        </div>`;
    }
}

module.exports = App;