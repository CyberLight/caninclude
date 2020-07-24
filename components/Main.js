const { html, Component } = require('htm/preact');
const SearchForm = require('./SearchForm');
const Footer = require('./Footer');
const GithubCorner = require('./GithubCorner');

class Main extends Component {
    render({ children, form, tags, request }) {
        const hasTags = tags && tags.length > 0;
        return html`
        <div class="app">
            <header class="header">
                <${SearchForm} ...${form} show="${hasTags}"/>
                <${GithubCorner}/>
            </header>
            ${children}
            <${Footer} 
                count="${request && request.count || '0'}" 
                uniqCount="${request && request.uniqCount || '0'}" 
                twoWeeksStat="${request && request.twoWeeksStat || []}"
                twoWeeksStatTotalCount="${request && request.twoWeeksStatTotalCount || 1}"
            />
        </div>`;
    }
}

module.exports = Main;