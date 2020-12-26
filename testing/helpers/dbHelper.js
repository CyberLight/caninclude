// eslint-disable-next-line import/no-extraneous-dependencies
const Helper = require('@codeceptjs/helper');
const util = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const faker = require('faker');

const { getConnection } = require('../../server');

const htmlTags = [
  'a', 'abbr', 'address', 'area', 'article', 'aside',
  'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote',
  'body', 'br', 'button', 'canvas', 'caption', 'cite',
  'code', 'col', 'colgroup', 'data', 'datalist', 'dd',
  'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
  'em', 'embed', 'fieldset', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header',
  'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input',
  'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link',
  'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter',
  'nav', 'noscript', 'object', 'ol', 'optgroup', 'option',
  'output', 'p', 'param', 'pre', 'progress', 'q', 'rb', 'rp',
  'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section',
  'select', 'small', 'source', 'span', 'strong', 'style',
  'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template',
  'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr',
  'track', 'u', 'ul', 'var', 'video', 'wbr'];

function promisifyConnection(conn) {
  return {
    get: util.promisify(conn.database.get).bind(conn.database),
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        conn.database.run(sql, params, function runCallback(err) {
          if (err) return reject(err);
          return resolve(this.lastID);
        });
      });
    },
  };
}

class DbHelper extends Helper {
  // before/after hooks
  /**
   * @protected
   */
  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _before() {
    // remove if not used
  }

  /**
   * @protected
   */
  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _after() {
    // remove if not used
  }

  // add custom methods here
  // If you need to access other helpers
  // use: this.helpers['helperName']

  // eslint-disable-next-line class-methods-use-this
  async haveHistoryItemInDb({
    parent, child, canInclude, count = 1,
  } = {}) {
    const con = promisifyConnection(getConnection());
    const lastId = await con.run(
      'INSERT INTO history(parent, child, canInclude, count) VALUES(?,?,?,?)',
      [parent, child, canInclude.toLowerCase(), count],
    );
    const row = await con.get('SELECT * FROM history WHERE id = ?', [lastId]);
    return row;
  }

  async haveANumberOfHistoryItemsInDb(count) {
    const results = [];
    for (let i = 1; i <= count; i += 1) {
      const item = {
        parent: faker.random.arrayElement(htmlTags),
        child: faker.random.arrayElement(htmlTags),
        canInclude: faker.random.arrayElement(['yes', 'no', 'doubt']),
        count: faker.random.number({ min: 1, max: 100 }),
      };
      // eslint-disable-next-line no-await-in-loop
      const row = await this.haveHistoryItemInDb(item);
      results.push(row);
    }
    return results;
  }
}

module.exports = DbHelper;
