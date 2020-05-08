const { html, Component } = require('htm/preact');
const Main = require('./Main');
const ColorText = require('./ColorText');

class ErrorPage extends Component {
    render({ request }) {
        return html`
        <${Main} request="${request}">
            <main class="content error-container">
                <section class="error__image"></section>
                <section class="error__info">
                    <h1 class="error__title"><${ColorText}>Something went wrong!</${ColorText}></h1>
                    <p>
                        You did something wrong:
                        <ul>
                            <li>Entered data in the wrong format</li>
                            <li>Or is it a mistake in the logic of the web application</li>
                            <li>Or you are a hacker :)</li>
                            <li>Or are you attentive QA</li>
                        </ul>
                        <p>Please, go <span><a class="error__link" href="${request.url}">back</a></span> and try again</p>
                    </p>
                </section>
            </main>
        </${Main}>`;
    }
}

module.exports = ErrorPage;