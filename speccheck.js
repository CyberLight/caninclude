/* eslint-disable no-restricted-syntax */
// eslint-disable-next-line import/no-extraneous-dependencies
const expect = require('expect');
const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);

function normalize(text) {
  return text.replace(/(\s+|\n)/gi, ' ');
}

function joinElements(list) {
  return normalize(list.map((v) => {
    if (typeof v === 'string') {
      return v;
    }
    return v.text;
  }).join(''));
}

(async function start() {
  try {
    const specContent = await readFile('./specindex.json');
    const specJson = JSON.parse(specContent);

    // eslint-disable-next-line no-restricted-syntax
    for (const tag of Object.keys(specJson.index)) {
      const { props } = specJson.index[tag];
      for (const section of ['Categories', 'ContextsInWhichThisElementCanBeUsed', 'ContentModel']) {
        props[section].forEach((o) => {
          try {
            expect(normalize(o.textContent)).toStrictEqual(joinElements(o.elements));
          } catch (e) {
            throw new Error(`The tag: "${tag}" has a problem in the section "${section}": ${e}`);
          }
        });
      }
    }
    // eslint-disable-next-line no-console
    console.log('[speccheck.js] [OK] specindex healthy!');
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[speccheck.js] [FAIL] ', e);
    process.exit(1);
  }
}());
