const { html, Component } = require('htm/preact');
const SearchForm = require('./SearchForm');
const MainSearchForm = require('./MainSearchForm');
const Tags = require('./Tags');
const Section = require('./Section');
const ResultSection = require('./ResultSection');
const Footer = require('./Footer');
const Tips = require('./Tips');
const About = require('./About');
const QuickResults = require('./QuickResults');
const CookieConsent = require('./CookieConsent');
const NewFeedback = require('./NewFeedback');
const TagFeedbacks = require('./TagFeedbacks');
const Main = require('./Main');

class App extends Component {
    render({ form, tags, tips = [], tagStats, request, specVersion, votes, userAcceptCookie, showFeedback, showFeedbacks, feedback, feedbacks, canAddFeedback }) {
        const hasTags = tags.length > 0;

        return html`
            <${Main} form="${form}" tags="${tags}" request="${request}">
                ${ !userAcceptCookie && html`<${CookieConsent}/>` }
                <main class="content">
                    <${Tips} tips="${tips}"/>
                    <${NewFeedback} request="${request}" form="${form}" show="${showFeedback}"/>
                    <${TagFeedbacks} request="${request}" feedbacks="${feedbacks}" show="${showFeedbacks}" />
                    <${Tags} show="${hasTags}">
                        <input checked id="first" class="tab__option" type="radio" name="tabs" value="first"/>
                        <label class="tab__name" for="first">${tags.length && tags[0].tags.list.map(item => `<${item}/>`).join(', ')}</label>
                        <input id="second" class="tab__option" type="radio" name="tabs" value="second"/>
                        <label class="tab__name" for="second">${tags.length && tags[2].tags.list.map(item => `<${item}/>`).join(', ')}</label>
                        <${Section} tag="${tags[0]}" accent="first"/>
                        <${ResultSection} ..."${tags[1]}" request="${request}" votes="${votes}" feedback="${feedback}" userAcceptCookie="${userAcceptCookie}" canAddFeedback="${canAddFeedback}"/>
                        <${Section} tag="${tags[2]}" accent="last"/>
                    </${Tags}>
                    <${About} show="${!hasTags}">
                        <${MainSearchForm} ...${form} show="${!hasTags}" specVersion="${specVersion}"/>
                        <${QuickResults} tagStats="${tagStats}"/>
                        <div class="about__description">This site helps you understand which tag you can include in another using the <a target="_blank" rel="noopener noreferrer" class="link--no-decoration" href="https://html.spec.whatwg.org"> WHATWG HTML specification </a></div>
                        <div class="about__description">* This is an alpha version and uses a simple algorithm to test whether one tag can be included in another.</div>
                    </${About}>
                </main>
            </${Main}>`;
    }
}

module.exports = App;