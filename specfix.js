const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const keywordsMapping = {};

(async function start() {
  const specContent = await readFile('./spec.json');
  const specJson = JSON.parse(specContent);

  function process(section) {
    const negativeKeywords = [];
    const conditionalKeywords = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const obj of section) {
      let prevNegative = false;
      let prevCondition = false;
      // eslint-disable-next-line no-restricted-syntax
      for (const element of obj.elements) {
        if (typeof element === 'string') {
          const canContinue = /,/.test(element) && !/./.test(element);
          const hasOrAnd = /(\b(and|or)\b)/.test(element);
          prevNegative = /(\b([Nn]o|[Nn]ot)\b(?! (more than one)))/.test(element) || (prevNegative && (hasOrAnd || canContinue));
          prevCondition = /(\b([Ii]f|[Uu]nless)\b)/.test(element) || (prevCondition && (hasOrAnd || canContinue));
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
    let sectionProps = process(tag.props.Categories);
    // eslint-disable-next-line no-param-reassign
    tag.props.sections.Categories = sectionProps;

    sectionProps = process(tag.props.ContentModel);
    // eslint-disable-next-line no-param-reassign
    tag.props.sections.ContentModel = sectionProps;
    return tag;
  });

  await writeFile('./spec_fixed.json', JSON.stringify({ version: specJson.version, keywordsMapping, result: processed }, ' ', 2));
}());
