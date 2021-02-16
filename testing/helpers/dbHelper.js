// eslint-disable-next-line import/no-extraneous-dependencies
const Helper = require('@codeceptjs/helper');
const util = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const faker = require('faker');

const { getConnection } = require('../../server');

const htmlTags = ['html', 'head', 'title', 'base', 'link', 'meta',
  'style', 'body', 'article', 'section', 'nav',
  'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hgroup', 'header', 'footer', 'address', 'p',
  'hr', 'pre', 'blockquote', 'ol', 'ul', 'menu',
  'li', 'dl', 'dt', 'dd', 'figure', 'figcaption',
  'main', 'div', 'a', 'em', 'strong', 'small', 's',
  'cite', 'q', 'dfn', 'abbr', 'ruby', 'rt', 'rp',
  'data', 'time', 'code', 'var', 'samp', 'kbd',
  'sub', 'sup', 'i', 'b', 'u', 'mark', 'bdi',
  'bdo', 'span', 'br', 'wbr', 'ins', 'del',
  'picture', 'source', 'img', 'iframe', 'embed',
  'object', 'param', 'video', 'audio', 'track',
  'map', 'area', 'table', 'caption', 'colgroup',
  'col', 'tbody', 'thead', 'tfoot', 'tr', 'td',
  'th', 'form', 'label', 'input', 'button',
  'select', 'datalist', 'optgroup', 'option',
  'textarea', 'output', 'progress', 'meter',
  'fieldset', 'legend', 'details', 'summary',
  'dialog', 'script', 'noscript', 'template',
  'slot', 'canvas'];

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
    parent, child, canInclude, count = 1, created = Date.now(),
  } = {}) {
    const con = promisifyConnection(getConnection());
    const lastId = await con.run(
      'INSERT INTO history(parent, child, canInclude, count, created) VALUES(?,?,?,?,?)',
      [parent, child, canInclude.toLowerCase(), count, created],
    );
    const row = await con.get('SELECT * FROM history WHERE id = ?', [lastId]);
    return row;
  }

  // eslint-disable-next-line class-methods-use-this
  async haveLikeItemInDb({
    parent = faker.random.arrayElement(htmlTags),
    child = faker.random.arrayElement(htmlTags),
    user = faker.random.uuid(),
    type = faker.random.arrayElement(['like', 'dislike', 'unknown']),
  } = {}) {
    const con = promisifyConnection(getConnection());
    const lastId = await con.run(
      'INSERT INTO likes(user, parent, child, type) VALUES(?,?,?,?)',
      [user, parent, child, type],
    );
    const row = await con.get('SELECT * FROM likes WHERE id = ?', [lastId]);
    return row;
  }

  async haveHistoryItemsInDb(items) {
    const results = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      // eslint-disable-next-line no-await-in-loop
      const row = await this.haveHistoryItemInDb(item);
      results.push(row);
    }
    return results;
  }

  async haveLikeItemsInDb(items) {
    const results = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      // eslint-disable-next-line no-await-in-loop
      const row = await this.haveLikeItemInDb(item);
      results.push(row);
    }
    return results;
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
