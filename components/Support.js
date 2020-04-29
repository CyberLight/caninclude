const { html, Component } = require('htm/preact');

class Support extends Component {   
    render({ data }) {
        return html`
            <table class="tag__table">
                <tr class="table__head">
                    <th>Browser</th>
                    <th>Web HTML</th>
                    <th>Web API</th>
                    <th>CanIUse</th>
                </tr>
                ${Object.entries(data).map(([browser, row]) => 
                    html`<tr class="table__tr"><td>${browser}</td>${Object.values(row)
                            .map(cell => html`<td>${cell}</td>`)}</tr>`)}  
            </table>
        `;
    }
}

module.exports = Support;