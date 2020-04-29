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

function streamBody(req, res, props = {}, css) {
    const body = renderToString(html`<${App} ...${props}/>`);
    const { styles } = new CleanCSS().minify(css);
    const readable = Readable.from(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${styles}</style>
        </head>
        <body>${body}</body>
    </html>`);
    readable.pipe(res);
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
    const parentTag = db[parent];
    const childTag = db[child];

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
    console.warn('[i] Begin read database');
    const jsonDb = await readFile('./spec.json');
    css = await readFile('./components/App.css', { encoding: 'utf8' });
    db = makeIndex(JSON.parse(jsonDb));
    console.warn('[i] End of reading database');
    console.log(`Example app listening at http://localhost:${port}`);
});