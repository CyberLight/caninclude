const { html, Component } = require('htm/preact');
const { getBarCssByValues } = require('../utils');

class TwoWeeksCounterBars extends Component {
    render({ bars = [], total = 1 }) {
        return html`
        <div class="footer__twoweek_counter">
            <div class="twoweek_counter__bars">
                ${bars.map(line => {
                    const { heightInPercent, zIndex } = getBarCssByValues(line.nowCount, line.prevCount, total);
                    return html`<div class="bars__bar bars__bar--red" style="height: ${heightInPercent}%;z-index: ${zIndex};"></div>`
                })}
            </div>
            <div class="twoweek_counter__bars">
                ${bars.map(line => {
                    const { heightInPercent, zIndex } = getBarCssByValues(line.prevCount, line.nowCount, total);
                    return html`<div class="bars__bar bars__bar--green" style="height: ${heightInPercent}%;z-index: ${zIndex};"></div>`
                })}
            </div>
        </div>`;
    }
}

module.exports = TwoWeeksCounterBars;
