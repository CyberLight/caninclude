const { html, Component } = require('htm/preact');
const SearchForm = require('./SearchForm');
const MainSearchForm = require('./MainSearchForm');
const Tags = require('./Tags');
const Section = require('./Section');
const ResultSection = require('./ResultSection');
const Footer = require('./Footer');
const Tips = require('./Tips');
const About = require('./About');

class App extends Component {
    render({ form, tags, tips = [] }) {
        const hasTags = tags.length > 0;

        return html`
        <div class="app">
            <header class="header">
                <${SearchForm} ...${form} show="${hasTags}"/>
                <a class="header__marker" href="#">
                    <div class="marker__content">Alpha<br/>version</div>
                </a>
            </header>
            <main class="content">
                <${Tips} tips="${tips}"/>
                <${Tags} show="${hasTags}">
                    <${Section} tag="${tags[0]}" accent="first"/>
                    <${ResultSection} ..."${tags[1]}"/>
                    <${Section} tag="${tags[2]}" accent="last"/>
                </${Tags}>
                <${About} show="${!hasTags}">
                    <${MainSearchForm} ...${form} show="${!hasTags}"/>
                    <div class="about__description">This site helps you understand which tag you can include in another using the <a class="link--no-decoration" href="https://html.spec.whatwg.org"> WHATWG HTML specification </a></div>
                    <div class="about__description">* This is an alpha version and uses a simple algorithm to test whether one tag can be included in another.</div>
                </${About}>
            </main>
            <${Footer}/>
        </div>`;
    }
}

module.exports = App;