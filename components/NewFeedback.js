const { html, Component } = require('htm/preact');

class NewFeedback extends Component {
    render({ request, show, form }) {
        return show && html`
           <form class="feedback-form" action="/feedback/new" method="POST">
                <textarea autofocus required minlength="10" class="feedback-form__text" id="feedback" name="feedback" cols="10" rows="3" maxlength="280" charswidth="23" placeholder="Type feedback text here..."></textarea>
                <input type="hidden" name="parent" value="${form.parent}"/>
                <input type="hidden" name="child" value="${form.child}"/>
                <div class="feedback-form__actions">
                    <button type="submit" class="actions__button actions__button--submit">Submit</button>
                    <a href="${request.url}" type="button" class="actions__button actions__button--cancel">Cancel</a>
                </div>
           </form> 
        `;
    }
}

module.exports = NewFeedback;