// eslint-disable-next-line import/no-extraneous-dependencies
const Helper = require('@codeceptjs/helper');
const util = require('util');
const { getConnection } = require('../../server');

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
  async haveHistoryItemInDb({ parent, child, canInclude }) {
    const con = promisifyConnection(getConnection());
    const lastId = await con.run(
      'INSERT INTO history(parent, child, canInclude, count) VALUES(?,?,?,1)',
      [parent, child, canInclude.toLowerCase()],
    );
    const row = await con.get('SELECT * FROM history WHERE id = ?', [lastId]);
    return row;
  }
}

module.exports = DbHelper;
