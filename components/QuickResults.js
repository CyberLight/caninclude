const { html, Component } = require('htm/preact');

class QuickResults extends Component {
    mapCanIncludeClass(type) { 
        return `table__col--${type.toLowerCase()}`; 
    }

    render({ tagStats = [] }) {
        return tagStats && html`
                    <section class="about__quick-results">
                        <h4 class="quick-results__header"><i>Last ${tagStats.length} Quick Results</i></h4>
                        <table class="quick-results__table">
                            <tr class="table__head">
                                <th class="table__col">Child</th>
                                <th class="table__col">Parent</th>
                                <th class="table__col">Can Include?</th>
                                <th class="table__col">Count</th>
                                <th class="table__col">Link to</th>
                            </tr>
                            ${tagStats.map(({ child, parent, canInclude, count }) =>
                                html`
                                <tr class="table__row">
                                    <td class="table__col">${child}</td>
                                    <td class="table__col">${parent}</td>
                                    <td class="table__col ${this.mapCanIncludeClass(canInclude)}">${canInclude}</td>
                                    <td class="table__col">${count}</td>
                                    <td class="table__col"><a class="table__link" href="/can/include/?child=${child}&parent=${parent}">result</a></td>
                                </tr>`)}
                        </table>
                    </section>`
    };
}

module.exports = QuickResults;