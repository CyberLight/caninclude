const { html, Component } = require('htm/preact');
const Main = require('./Main');
const AdminFeedbacks = require('./AdminFeedbacks');

class AdminPage extends Component {
    render({ request, ...other }) {
        return html`
        <${Main} request="${request}">
            <main class="content error-container">
                <${AdminFeedbacks} ...${other} show />
            </main>
        </${Main}>`;
    }
}

module.exports = AdminPage;