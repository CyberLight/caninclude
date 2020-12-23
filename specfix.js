const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const keywordsMapping = {};

(async function start() {
  const specContent = await readFile('./spec.json');
  const specJson = JSON.parse(specContent);

  function processNegative(section) {
    const negativeKeywords = [];
    const conditionalKeywords = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const obj of section) {
      let prevNegative = false;
      let prevCondition = false;
      // eslint-disable-next-line no-restricted-syntax
      for (const element of obj.elements) {
        if (typeof element === 'string') {
          prevNegative = /(\b(No|no|not|Not)\b(?! (more than one)))/.test(element) || (prevNegative && (/(\b(and|or)\b)/.test(element) || /,/.test(element)));
          prevCondition = /(\b(If|if|unless)\b)/.test(element) || (prevCondition && (/(\b(and|or)\b)/.test(element) || /,/.test(element)));
        } else {
          keywordsMapping[element.hashText] = element;
          if (prevNegative) {
            negativeKeywords.push(element.hashText);
          }
          if (prevCondition) {
            conditionalKeywords.push(element.hashText);
          }
        }
      }
    }

    return {
      negativeKeywords: [...new Set(negativeKeywords)].map((item) => item.toLowerCase()),
      conditionalKeywords: [...new Set(conditionalKeywords)].map((item) => item.toLowerCase()),
    };
  }

  const processed = specJson.result.map((tag) => {
    // eslint-disable-next-line no-param-reassign
    tag.props.sections = tag.props.sections || {};
    let sectionProps = processNegative(tag.props.Categories);
    // eslint-disable-next-line no-param-reassign
    tag.props.sections.Categories = sectionProps;

    sectionProps = processNegative(tag.props.ContentModel);
    // eslint-disable-next-line no-param-reassign
    tag.props.sections.ContentModel = sectionProps;
    return tag;
  });

  await writeFile('./spec.json', JSON.stringify({ version: specJson.version, keywordsMapping, result: processed }, ' ', 2));
}());
