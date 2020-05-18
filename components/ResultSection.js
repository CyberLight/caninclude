const { html, Component } = require('htm/preact');

class ResultSection extends Component {
    getIconClass(props) {
        if (props['success']) {
            return 'section-result__icon--success';
        } else if (props['fail']) {
            return 'section-result__icon--fail';
        } else if (props['doubt']) {
            return 'section-result__icon--doubt';
        }
        return 'section-result__icon--unknown';
    }

    getSectionClass(props) {
        if (props['success']) {
            return 'tag__section-result--success';
        } else if (props['fail']) {
            return 'tag__section-result--fail';
        } else if (props['doubt']) {
            return 'tag__section-result--doubt';
        }
        return 'tag__section-result--unknown';
    }

    render(props) {
        const votes = props.votes;
        return html`
        <section class="tag__section-result ${this.getSectionClass(props)}">
            <h2 class="section__title">Result of the ability to include a tag in a tag</h2>
            <div class="tag__section-content">
                <div class="section-result__container">
                    <div class="section-result__icon ${this.getIconClass(props)}"></div>
                    <div class="section-result__text">${props.text}</div>
                </div>
                <div class="reaction-container">
                    <a class="like like--${votes.liked ? 'active' : 'normal'}" href="${props.request.url}&${votes.liked ? 'unlike' : 'like' }"></a>
                    <span>${votes.likes}</span>
                </div>
                <div class="reaction-container">
                    <a class="dislike dislike--${votes.disliked ? 'active' : 'normal'}" href="${props.request.url}&${votes.disliked ? 'undislike' : 'dislike'}"></a>
                    <span>${votes.dislikes}</span>
                </div>
                ${ props.canAddFeedback && html`
                <div class="reaction-container">
                    <a class="feedback feedback--${votes.user ? 'active' : 'normal'}" href="${props.request.url}&feedback" title="New feedback"></a>
                    <span>new</span>
                </div>` 
                }
                <div class="reaction-container">
                    <a class="feedbacks feedbacks--${votes.user ? 'active' : 'normal'}" href="${props.request.url}&feedbacks" title="List of feedbacks"></a>
                    <span>list [${props.feedback.count}]</span>
                </div>
            </div>
        </section>`;
    }
}

module.exports = ResultSection;