const util = require('util');
const md5 = require('md5');
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require('uuid');



!async function run() {
    const options = process.argv.slice(2);
    if (!options.length) {
        throw new Error('No parameters');
    }

    const dbConn = new sqlite3.Database("./.data/sqlite.db");
    const runAsync = util.promisify(dbConn.run).bind(dbConn);
    const closeAsync = util.promisify(dbConn.close).bind(dbConn);
    const argsDict = Object.fromEntries(options.map(v => v.split('=')));
    const key = md5(`${uuidv4()}${argsDict.role}`);
    await runAsync(`INSERT INTO invites(key, role) VALUES(?,?)`, [key, argsDict.role]);
    console.log(`/invites/${key}/apply`);
    await closeAsync();
}();