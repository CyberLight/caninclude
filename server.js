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
const port = 3000;
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

const queryRouter = express.Router();
queryRouter.get('/include', (req, res) => {
    const { parent, child } = req.query;
    const parentTag = db[parent];
    const childTag = db[child];
    const result = { unknown: true };
    const props = { 
        form: { parent, result, child }, 
        tags: [childTag, result, parentTag]
    };
    streamBody(req, res, props, css);
});

app.get('/', (req, res) => {
    const result = { unknown: true };
    const props = { 
        form: { parent: '', child: '' }, 
        tags: [ null, result, null ] 
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