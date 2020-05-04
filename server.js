const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const CleanCSS = require('clean-css');
const { html } = require('htm/preact');
const { Readable } = require('stream');
const { Scheduler, Counter, shortenNumber } = require('./utils');

const App = require('./components/App');
const renderToString = require('preact-render-to-string');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const app = express();
const scheduler = new Scheduler(1000 * 10);
const counter = new Counter();

const port = process.env.PORT || 3000;
const messages = {
    makeTransparentContentWarning(parentFormatted) {
        return `Because the parent <${parentFormatted}/> tag has the Transparent content option and the ability to nest the tag is not fully understood. Please look at the nearest top element from the <${parentFormatted}/> tag (in your HTML markup) or check the "Content Model" <${parentFormatted}/> tag section for more details.`;
    },
    makeAllMessagesConditional(parentFormatted, childFormatted) {
        return `The parent "Content Model" section contains only conditional If statements. Please check if the child tag <${childFormatted}/> matches the conditions of the parent <${parentFormatted}/>, and make a decision based on this.`;
    }
};

let searchStatMap = makeSortedMap();
let db = null;
let css = '';

scheduler.start();
scheduler.schedule(function () {
    const content = JSON.stringify([...searchStatMap]);
    writeFile('./searchstat.json', content).then(() => this.emit('next'));
    counter.store();
});

function makeSortedMap(initValue = []) {
    let map = new Map(initValue); 
    map[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
    }
    return map;
}

function copyObj(o) {
    return JSON.parse(JSON.stringify(o));
}

function makeIndex(db) {
    return db.reduce((o, el) => {
        const names = el.tags.list.slice(0);

        for (const tag of names) {
            const copyOfEl = copyObj(el);
            copyOfEl.tags.list = [tag];
            o[tag] = copyOfEl;
        }
        return o;
    }, {});
}

function compareVersions(v1, v2) {
    const normalize = p => p.replace(/[a-z]+/g, '');
    let v1Parts = v1.split('.').map(v => Number(normalize(v)));
    let v2Parts = v2.split('.').map(v => Number(normalize(v)));
    const diff = Math.abs(v1Parts.length - v2Parts.length);
    if (v1Parts.length < v2Parts.length) {
        v1Parts = v1Parts.concat(new Array(diff).fill(0));
    } else if (v2Parts.length < v1Parts.length) {
        v2Parts = v2Parts.concat(new Array(diff).fill(0));
    }
    let result = 0;
    for (let index = 0; index < v1Parts.length; index++) {
        const left = v1Parts[index];
        const right = v2Parts[index];
        if (left !== right) {
            return Math.sign(left - right) * 1;
        }
    }
    return result;
}

const usedOlderVersion = compareVersions('v12.14.1', process.version) === 1;

function sendContent(content, res) {
    if (usedOlderVersion) {
        res.end(content);
    } else {
        const readable = Readable.from(content);
        readable.pipe(res);
    }
}

function streamBody(req, res, props = {}, css) {
    const body = renderToString(html`<${App} ...${props}/>`);
    const { styles } = new CleanCSS().minify(css);
    sendContent(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${styles}</style>
        </head>
        <body>${body}</body>
    </html>`, res);
} 

function createSetOfKeyWords(tag, categoryName, forceAddTagName = false) {
    const keyWordSet = tag.props[categoryName].reduce((o, item) => {
        for (const keyWord of item.keywords) {
            o.add(keyWord.text.toLowerCase());
        }
        return o;
    }, new Set());

    if (!keyWordSet.size || keyWordSet.has('sectioning root') || forceAddTagName) {
        for (const tagName of tag.tags.list) {
            keyWordSet.add(tagName);
        }
    }
    return keyWordSet;
}

function updateSearchStatMap(pairKey) {
    searchStatMap.set(pairKey, (searchStatMap.get(pairKey) || 0) + 1);
    const ItemsCount = 10;
    if (searchStatMap.size > ItemsCount) {
        searchStatMap = makeSortedMap([...searchStatMap].slice(-1 * ItemsCount));
    }
}

function canInclude(childTag, parentTag, childFormatted, parentFormatted) {
    const childKeyWordsSet = createSetOfKeyWords(childTag, 'Categories', true);
    const parentKeyWordsSet = createSetOfKeyWords(parentTag, 'ContentModel');
    const intersection = new Set([...parentKeyWordsSet].filter(x => childKeyWordsSet.has(x)));

    const { negativeKeywords } = parentTag.props.sections['ContentModel'];
    const { conditionalKeywords } = childTag.props.sections['Categories'];
    
    conditionalKeywords.forEach(el => {
        childKeyWordsSet.delete(el);
        intersection.delete(el);
    });

    const allConditional = parentTag.props.ContentModel.every(o => o.textContent.startsWith('If'))
    if (allConditional) {
        return { type: 'Doubt', doubt: true, text: 'I doubt', message: messages.makeAllMessagesConditional(parentFormatted, childFormatted) };
    }

    const hasNegativeKeywords = new Set(negativeKeywords.filter(x => childKeyWordsSet.has(x)));
    if (hasNegativeKeywords.size > 0) {
        return { type: 'No', fail: true, text: 'No, you can\'t!' };
    }

    if (parentKeyWordsSet.has('transparent')) {
        return { type: 'Doubt', doubt: true, text: 'I doubt', message: messages.makeTransparentContentWarning(parentFormatted) };
    } else if (!intersection.size) {
        return { type: 'No', fail: true, text: 'No, you can\'t!' };
    } else if (intersection.size) {
        return { type: 'Yes', success: true, text: 'Yes, you can!' };
    }

    return { unknown: true };
}

const queryRouter = express.Router();
queryRouter.get('/include', (req, res) => {
    const tips = [];
    const { parent, child } = req.query;
    const parentFormatted = parent.toLowerCase();
    const childFormatted = child.toLowerCase();
    
    const parentTag = db[parentFormatted];
    const childTag = db[childFormatted];
    if (!parentTag || !childTag) return res.redirect('/');

    const result = canInclude(childTag, parentTag, childFormatted, parentFormatted);
    const pairKey = `${childFormatted}|${parentFormatted}|${result.type}`.toLowerCase();
    updateSearchStatMap(pairKey);

    if (result.doubt) {
        tips.push(result.message);
    }

    const props = { 
        form: { parent: parentFormatted, result, child: childFormatted }, 
        tags: [ childTag, result, parentTag ],
        tips,
        request: {
            count: counter.count
        }
    };

    streamBody(req, res, props, css);
});

function checkHttps(req, res, next) {
    if (!req.get('X-Forwarded-Proto') || req.get('X-Forwarded-Proto').indexOf("https") != -1) {
        return next()
    } else {
        res.redirect(`https://${req.hostname}${req.url}`);
    }
}

function countRquests(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.ip = ip;
    counter.register(ip.split(',')[0]);
    next();
}

app.use(countRquests);
app.all('*', checkHttps);
app.get('/', (req, res) => {
    const props = { 
        form: { parent: '', child: '' }, 
        tags: [],
        tagStats: [...searchStatMap].map(([result, count]) => {
            const [child, parent, canInclude] = result.split('|');
            return { child, parent, canInclude, count: shortenNumber(count) };
        }),
        request: {
            count: counter.count
        }
    };
    streamBody(req, res, props, css);
});

app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/can', queryRouter);

app.listen(port, async () => {
    console.warn('usedOlderVersion:', usedOlderVersion, 'current version:', process.version);
    console.warn('[i] Begin read database');
    const jsonDb = await readFile('./spec.json');
    css = await readFile('./components/App.css', { encoding: 'utf8' });
    db = makeIndex(JSON.parse(jsonDb));
    console.warn('[i] End of reading database');
    console.warn('[i] Begin read searchstat.json');
    const searchStat = await readFile('./searchstat.json');
    searchStatMap = makeSortedMap(JSON.parse(searchStat));
    counter.load().catch(e => console.warn(e.message));
    console.warn('[i] End of reading searchstat.json');
    console.log(`Example app listening at http://localhost:${port}`);
});