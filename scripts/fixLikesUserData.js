const util = require('util');
const sqlite3 = require("sqlite3").verbose();

!async function run() {
    const dbConn = new sqlite3.Database("./.data/sqlite.db");
    const closeAsync = util.promisify(dbConn.close).bind(dbConn);
    const changes = await new Promise((resolve, reject) => {
        dbConn.run(`UPDATE likes SET user=substr(user, 0, 37) WHERE length(user) > 36`, [], function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.changes);
        });
    });
    console.warn('changed likes:', changes);
    await closeAsync();
}();