const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);
// const writeFile = util.promisify(fs.writeFile);

(async function start() {
  const specContent = await readFile('./spec.json');
  const specJson = JSON.parse(specContent);
  const tagNames = new Set(specJson.result.reduce(
    (tagMap, tag) => tagMap.concat(tag.tags.list),
    [],
  ));
  // eslint-disable-next-line no-console
  console.warn(JSON.stringify([...tagNames]));
}());
