const { html, Component } = require('htm/preact');

class AdminFeedbacks extends Component {
    render({ feedbacks = [], currentPage, totalPages, show }) {
        return show && feedbacks && feedbacks.length && html`
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
                        <th class="table__col table__col--left">ID</th>
                        <th class="table__col table__col--left">Text</th>
                        <th class="table__col table__col--center">UserId</th>
                        <th class="table__col table__col--center">Tags Pair</th>
                        <th class="table__col table__col--center table__col--small">Resolved</th>
                        <th class="table__col table__col--center table__col--small">Approved</th>
                        <th class="table__col table__col--center table__col--small"></th>
                        <th class="table__col table__col--center table__col--small"></th>
                        <th class="table__col table__col--center table__col--small"></th>
                    </tr>
                    </thead>
                    <tbody>
                    ${ feedbacks.map(feedback => html`
                        <tr class="table__row">
                            <td class="table__col--center">${feedback.id}</td>
                            <td class="table__col--wrap table__col--small-text">${feedback.text}</td>
                            <td class="table__col--wrap table__col--small-text">${feedback.user}</td>
                            <td class="table__col--wrap table__col--center">${feedback.child} - ${feedback.parent}</td>
                            <td class="table__col--center">${feedback.resolved ? 'YES' : 'NO'}</td>
                            <td class="table__col--center">${feedback.approved ? 'YES' : 'NO'}</td>
                            <td class="table__col--center"><a class="table__link" href="${ feedback.approved ? `/admin/feedbacks/${feedback.id}/unapprove` : `/admin/feedbacks/${feedback.id}/approve`}">${feedback.approved ? 'Unapprove' : 'Approve' }</a></td>
                            <td class="table__col--center"><a class="table__link" href="/admin/feedbacks/${feedback.id}/resolve">Resolve</a></td>
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