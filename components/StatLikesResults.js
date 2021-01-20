const { html, Component } = require('htm/preact');

class StatLikesResults extends Component {
  // eslint-disable-next-line class-methods-use-this
  render({
    items = [], className = '', title = 'items', statisticsKey = 'last_most_tags',
  }) {
    return items && html`
                    <section class="about__quick-results">
                        <h2 class="quick-results__header ${className}"><i>Last ${items.length} ${title}</i></h2>
                        <table class="quick-results__table">
                            <tr class="table__head">
                                <th scope="col" class="table__col">Child</th>
                                <th scope="col" class="table__col">Parent</th>
                                <th scope="col" class="table__col">Count</th>
                                <th scope="col" class="table__col">Link to</th>
                            </tr>
                            ${items.map(({ child, parent, display }) => html`
                                <tr class="table__row table__row--dark">
                                    <td class="table__col">${child}</td>
                                    <td class="table__col">${parent}</td>
                                    <td class="table__col">${display}</td>
                                    <td class="table__col"><a class="table__link" href="/can/include/?child=${child}&parent=${parent}&statistics_key=${statisticsKey}">result</a></td>
                                </tr>`)}
                        </table>
                    </section>`;
  }
}

module.exports = StatLikesResults;
