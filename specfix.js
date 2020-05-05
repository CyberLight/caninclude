const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

!async function start() {
    const specContent = await readFile('./spec.json');
    const specJson = JSON.parse(specContent);

    function processNegative(section) {
        const keywords = section.reduce((acc, obj) => acc.concat(obj.keywords.reduce((acc, kw) => acc.concat(kw.text), [])), []);
        const negativeKeywords = [];
        const conditionalKeywords = [];

        for (const obj of section) {
            const resultNegative = obj.textContent.split(/(\b(no)\b)/);
            if (resultNegative.length > 1) {
                let prevPart = '';
                for (const part of resultNegative) {
                    if (['no', 'not'].includes(prevPart.toLowerCase())) {
                        const filteredKeywords = keywords.filter(value => new RegExp(`\\b(${value})\\b`, 'gi').test(part));
                        negativeKeywords.push(...filteredKeywords);
                    }
                    prevPart = part;
                }    
            }

            const conditionContent = obj.textContent.startsWith('If');
            if (conditionContent) {
                conditionalKeywords.push(...keywords.filter(value => !negativeKeywords.includes(value) && new RegExp(`\\b(${value})\\b`, 'gi').test(obj.textContent)));
            }
        }
        return { negativeKeywords: [...new Set(negativeKeywords)].map(item => item.toLowerCase()), conditionalKeywords: [...new Set(conditionalKeywords)].map(item => item.toLowerCase()) };
    }

    const processed = specJson.result.map(tag => {
        tag.props.sections = tag.props.sections || {};
        let sectionProps = processNegative(tag.props.Categories);
        tag.props.sections['Categories'] = sectionProps;

        sectionProps = processNegative(tag.props.ContentModel);
        tag.props.sections['ContentModel'] = sectionProps;
        return tag;
    });

    await writeFile('./spec.json', JSON.stringify({ version: specJson.version, result: processed }, ' ', 2));
}();