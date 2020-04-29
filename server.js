const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const CleanCSS = require('clean-css');
const { html } = require('htm/preact');
const { Readable } = require('stream');

const renderToString = require('preact-render-to-string');
const readFile = util.promisify(fs.readFile);

const App = require('./components/App');

const app = express();
const port = process.env.PORT || 3000;
let db = null;
let css = '';

function makeIndex(db) {
    return db.reduce((o, el) => {
        for (const tag of el.tags.list) {
            o[tag] = el;
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

const usedOlderVersion = compareVersions('v12.14.1', process.version) === -1;

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

function createSetOfKeyWords(tag, categoryName) {
    const keyWordSet = tag.props[categoryName].reduce((o, item) => {
        for (const keyWord of item.keywords) {
            o.add(keyWord.text.toLowerCase());
        }
        return o;
    }, new Set());

    if (!keyWordSet.size) {
        for (const tagName of tag.tags.list) {
            keyWordSet.add(tagName);
        }
    }
    return keyWordSet;
}

const queryRouter = express.Router();
queryRouter.get('/include', (req, res) => {
    const { parent, child } = req.query;
    const parentTag = db[parent.toLowerCase()];
    const childTag = db[child.toLowerCase()];

    if (!parentTag || !childTag) return res.redirect('/');

    let result = { unknown: true };
    const tips = [];

    const childKeyWordsSet = createSetOfKeyWords(childTag, 'Categories');
    const parentKeyWordsSet = createSetOfKeyWords(parentTag, 'ContentModel');
    const intersection = new Set([...parentKeyWordsSet].filter(x => childKeyWordsSet.has(x)));


    if (parentKeyWordsSet.has('transparent')) {
        result = { doubt: true, text: 'I doubt' };
        tips.push(`Because the parent <${parent}/> tag has the Transparent Content option. You must change the current parent to the closest upper element from the current parent or check Content model section for clarification`)
    } else if (!intersection.size) {
        result = { fail: true, text: 'No, you can\'t!' };
    } else {
        result = { success: true, text: 'Yes, you can!' };
    }

    const props = { 
        form: { parent, result, child }, 
        tags: [childTag, result, parentTag],
        tips
    };
    streamBody(req, res, props, css);
});

app.get('/', (req, res) => {
    const result = { unknown: true };
    const props = { 
        form: { parent: '', child: '' }, 
        tags: [] 
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
    console.log(`Example app listening at http://localhost:${port}`);
});