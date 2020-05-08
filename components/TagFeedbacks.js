const { html, Component } = require('htm/preact');

class TagFeedbacks extends Component {

    getText(feedback) {
        if (feedback.approved) {
            return feedback.text;
        } 
        return feedback.text.length > 0 ? `${feedback.text.slice(0, 50)}...` : feedback.text;
    }

    render({ feedbacks = [], request, show }) {
        return show && feedbacks && feedbacks.length && html`
        <section class="feedback-container">
           <h4>Last 10 feedbacks by current tag pair</h4>
           <a href="${request.url}" class="feedback__hide-button">Hide feedback</a>
            <div class="feedback__table-container">
                <table class="feedback__table">
                    <tr class="table__head">
                        <th class="table__col table__col--left">Text</th>
                        <th class="table__col table__col--center table__col--small">Yours</th>
                        <th class="table__col table__col--center table__col--small">Resolved</th>
                        <th class="table__col table__col--center table__col--small">Approved</th>
                    </tr>
                    ${ feedbacks.map(feedback => html`
                        <tr class="table__row">
                            <td class="table__col--wrap ${ feedback.approved ? '' : 'blurry-text' }">${this.getText(feedback)}</td>
                            <td class="table__col--center"><div class="feedback-icon ${request.user === feedback.user ? 'feedback-icon--your' : ''}"></div></td>
                            <td class="table__col--center"><div class="feedback-icon feedback-icon--${ feedback.resolved ? 'resolved' : 'wait' }"></div></td>
                            <td class="table__col--center"><div class="feedback-icon feedback-icon--${ feedback.approved ? 'approved' : 'wait' }"></div></td>
                        </tr>`)}
                </table>
            </div> 
        </section>` || null;
    }
}

module.exports = TagFeedbacks;