const fs = require('fs').promises;

function copyObj(o) {
  return JSON.parse(JSON.stringify(o));
}

(async function start() {
  const parsedDb = await fs.readFile('./spec.json').then((c) => JSON.parse(c));
  const { version } = parsedDb;
  const { keywordsMapping } = parsedDb;
  const dbIndex = parsedDb.result.reduce((o, el) => {
    const names = el.tags.list.slice(0);

    // eslint-disable-next-line no-restricted-syntax
    for (const tag of names) {
      const copyOfEl = copyObj(el);
      copyOfEl.tags.list = [tag];
      // eslint-disable-next-line no-param-reassign
      o[tag] = copyOfEl;
    }

    return o;
  }, {});
  await fs.writeFile('./specindex.json', JSON.stringify({ version, keywordsMapping, index: dbIndex }), { encoding: 'utf-8' });
}());
