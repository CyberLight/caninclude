const { html, Component } = require('htm/preact');

class Support extends Component {   
    reduceData(data) {
        const sites = ['WebHTMLElement', 'WebAPI', 'caniuse'];
        const browsers = sites.reduce((browsers, site) => {
            if (!data[site]) return browsers;
            const siteBrowsers = data[site].support.browsers;
            for (let [browser,] of siteBrowsers) {
                browsers.add(browser)
            }
            return browsers;
        }, new Set());

        const table = {};
        const cache = {};
        for (const site of sites) {
            for (const browser of browsers) {
                let supportBrowsers;
                if (data[site]) {
                    supportBrowsers = cache[site] || Object.fromEntries(data[site].support.browsers);
                    if (!cache[site]) cache[site] = supportBrowsers;
                }
                table[browser] = table[browser] || {}; 
                table[browser][site] = table[browser][site] || {};
                table[browser][site] = data[site] && supportBrowsers[browser] || '--';
            }
        }
        return table;
    }

    render({ data }) {
        const reducedData = this.reduceData(data);
        return html`
            <table class="tag__table">
                <tr class="table__head">
                    <th>Browser</th>
                    <th>Web HTML</th>
                    <th>Web API</th>
                    <th>CanIUse</th>
                </tr>
                ${Object.entries(reducedData).map(([browser, row]) => 
                    html`<tr><td>${browser}</td>${Object.values(row)
                            .map(cell => html`<td>${cell}</td>`)}</tr>`)}  
            </table>
        `;
    }
}

module.exports = Support;