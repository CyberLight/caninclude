const { html, Component } = require('htm/preact');

class Recommends extends Component {
  // eslint-disable-next-line class-methods-use-this
  render({ recommendation }) {
    return (recommendation && html`
            <div class="rec recommends">
                <span class="recommends__mark">
                Recommends with Attenuation Factor: ${recommendation.attenuation_factor.toFixed(10)}
                </span>
                <span class="recommends__text">
                Also looking at this pair of tags <a
                  class="recommends__link"
                  href="/can/include?child=${recommendation.child}&parent=${recommendation.parent}&recommend=1"
                >${`<${recommendation.child}/>`} inside ${`<${recommendation.parent}/>`}</a>
                </span>
            </div>`) || null;
  }
}

module.exports = Recommends;
