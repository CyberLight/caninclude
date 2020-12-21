const fs = require('fs').promises;

function copyObj(o) {
    return JSON.parse(JSON.stringify(o));
}

!async function start() {
    const jsonDb = await fs.readFile('./spec.json');
    const parsedDb = JSON.parse(jsonDb);
    const version = parsedDb.version;
    const dbIndex = parsedDb.result.reduce((o, el) => {
        const names = el.tags.list.slice(0);

        for (const tag of names) {
            const copyOfEl = copyObj(el);
            copyOfEl.tags.list = [tag];
            o[tag] = copyOfEl;
        }
        return o;
    }, {});
    await fs.writeFile('./specindex.json', JSON.stringify({ version, index: dbIndex }), { encoding: 'utf-8' });
}();