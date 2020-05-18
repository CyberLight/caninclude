const { html, Component } = require('htm/preact');

class AdminFeedbacks extends Component {
    render({ feedbacks = [], currentPage, totalPages, show }) {
        return show && html`
        <section class="feedback-container">
            <h1>Feedbacks</h1>
            <div class="feedback__table-container">
                <div>
                    ${new Array(totalPages).fill(0).map((_, index) => {
                        const pageNumber = index + 1;
                        return pageNumber === currentPage ? html`<span class="paginate__link">${pageNumber}</span>  ` : html`<a class="paginate__link" href="/admin/feedbacks?page=${pageNumber}">${pageNumber}</a>  `
                    })}
                </div>
                <table class="feedback__table">
                    <thead>
                    <tr class="table__head">
                        <th scope="col" class="table__col table__col--left">ID</th>
                        <th scope="col" class="table__col table__col--left">Text</th>
                        <th scope="col" class="table__col table__col--center">UserId</th>
                        <th scope="col" class="table__col table__col--center">Tags Pair</th>
                        <th scope="col" class="table__col table__col--center table__col--small">Resolved</th>
                        <th scope="col" class="table__col table__col--center table__col--small">Approved</th>
                        <th scope="col" class="table__col table__col--center table__col--small"></th>
                        <th scope="col" class="table__col table__col--center table__col--small"></th>
                        <th scope="col" class="table__col table__col--center table__col--small"></th>
                    </tr>
                    </thead>
                    <tbody>
                    ${ !feedbacks.length && html`<tr class="table__row"><td colspan="9" class="table__col--center">Empty</td></tr>` }
                    ${ feedbacks.map(feedback => html`
                        <tr class="table__row">
                            <td class="table__col--center">${feedback.id}</td>
                            <td class="table__col--wrap table__col--small-text">${feedback.text}</td>
                            <td class="table__col--wrap table__col--small-text">${feedback.user}</td>
                            <td class="table__col--wrap table__col--center">${feedback.child} - ${feedback.parent}</td>
                            <td class="table__col--center">${feedback.resolved ? 'YES' : 'NO'}</td>
                            <td class="table__col--center">${feedback.approved ? 'YES' : 'NO'}</td>
                            <td class="table__col--center"><a class="table__link" href="${ feedback.approved ? `/admin/feedbacks/${feedback.id}/unapprove` : `/admin/feedbacks/${feedback.id}/approve`}">${feedback.approved ? 'Unapprove' : 'Approve' }</a></td>
                            <td class="table__col--center"><a class="table__link" href="${ feedback.resolved ? `/admin/feedbacks/${feedback.id}/unresolve` : `/admin/feedbacks/${feedback.id}/resolve`}">${feedback.resolved ? 'Unresolve' : 'Resolve' }</a></td>
                            <td class="table__col--center"><a class="table__link" href="/admin/feedbacks/${feedback.id}/remove">Remove</a></td>
                        </tr>`)
                    }
                    </tbody>
                </table>
            </div> 
            <div>
                ${new Array(totalPages).fill(0).map((_, index) => {
                    const pageNumber = index + 1;
                    return pageNumber === currentPage ? html`<span class="paginate__link">${pageNumber}</span>  ` : html`<a class="paginate__link" href="/admin/feedbacks?page=${pageNumber}">${pageNumber}</a>  `
                })}
            </div>
        </section>` || null;
    }
}

module.exports = AdminFeedbacks;