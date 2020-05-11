const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const cookieSession = require('cookie-session');
const { v4: uuidv4 } = require('uuid');
const CleanCSS = require('clean-css');
const { html } = require('htm/preact');
const { Readable } = require('stream');
const { Scheduler, Counter, shortenNumber, LikesManager, DbConnection, FeedbackManager } = require('./utils');
const url = require('url');
const App = require('./components/App');
const ErrorPage = require('./components/ErrorPage');
const renderToString = require('preact-render-to-string');
const { check, validationResult } = require('express-validator');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const FeedbackDailyLimit = process.env.FEEDBACK_DAILY_LIMIT || 10;
const app = express();
const scheduler = new Scheduler(1000 * 60 * 10);
const counter = new Counter();

const dbConnection = new DbConnection("./.data/sqlite.db");
dbConnection.setup();

const likeManager = new LikesManager(dbConnection);
const feedbackManager = new FeedbackManager(dbConnection);


const port = process.env.PORT || 3000;
const messages = {
    makeTransparentContentWarning(parentFormatted) {
        return `Because the parent <b>&lt;${parentFormatted}/&gt;</b> tag has the <b>Transparent</b> content option and the ability to nest the tag is not fully understood.<br/> Please look at the nearest top element from the <b>&lt${parentFormatted}/&gt;</b> tag (in your HTML markup) or check the <b>Content Model</b> of <b>&lt;${parentFormatted}/&gt;</b> tag section for more details.`;
    },
    makeAllMessagesConditional(parentFormatted, childFormatted) {
        return `The parent <b>Content Model</b> section contains only conditional statements. Please check if the child tag <b>&lt;${childFormatted}/&gt;</b> matches the conditions of the parent <b>&lt;${parentFormatted}/&gt;</b>, and make a decision based on this.`;
    },
    makeMatched(matched, parentFormatted, childFormatted, negative) {
        const markMatched = s => {
            return negative && negative.has(s) ? `<b class="match-section match-section--no">NO <s>${s}</s> in parent</b>` : `<b class="match-section">${s}</b>`; 
        };
        return `The parent tag <b>&lt;${parentFormatted}/&gt;</b> with the <b>Content model</b> section and the child tag <b>&lt;${childFormatted}/&gt;</b> with the <b>Categories</b> section have matches: ${matched.map(match => markMatched(match))}`;
    }
};

const ErrorsCollection = {
    DuplicateFeedbackMessage: 'Error: Duplicate feedback message for the current tag pair from you',
    FeedbackLimitExceeded: 'Error: The daily limit for sending feedback text has been reached.',
    ConstraintsViolation: 'Error: One of the data restrictions is violated.'
}

function getMessageByError(e) {
    if (~e.message.indexOf('feedbacks.key') && ~e.message.indexOf('UNIQUE constraint failed')) {
        return 'DuplicateFeedbackMessage';
    }
    if (~e.message.indexOf('FEEDBACK limit exceeded')) {
        return 'FeedbackLimitExceeded';
    }
    if (e.message.endsWith('feedbacks') && ~e.message.indexOf('CHECK constraint failed')) {
        return 'ConstraintsViolation';
    }
    throw e;
}

let searchStatMap = makeSortedMap();
let db = null;
let css = '';
let specVersion = '';

scheduler.start();
scheduler.schedule(async function () {
    const content = JSON.stringify([...searchStatMap]);
    await writeFile('./searchstat.json', content);
    await counter.store();
    this.emit('next');
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
    return db.result.reduce((o, el) => {
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
            <meta property="og:title" content="Can I Include">
            <meta property="og:description" content="'Can I Include' tool to help determine if one HTML tag can be included in another HTML tag">
            <meta property="og:image" content="https://cdn.glitch.com/19f7087b-7781-4727-9c59-2100bafabbf2%2Fsite-preview.png?v=1588606121865">
            <meta property="og:url" content="https://caninclude.glitch.me/">
            <meta name="twitter:card" content="summary_large_image">
            <meta property="og:site_name" content="Can I Include">

            <meta name="twitter:title" content="Can I Include">
            <meta name="twitter:description" content="'Can I Include' tool to help determine if one HTML tag can be included in another HTML tag">
            <meta name="twitter:image" content="https://cdn.glitch.com/19f7087b-7781-4727-9c59-2100bafabbf2%2Fsite-preview.png?v=1588606121865">
            <meta name="twitter:image:alt" content="Can I Include [main page]">
            <style>${styles}</style>
        </head>
        <body>${body}</body>
    </html>`, res);
} 

function streamPage(req, res, htmlObj, css) {
    const body = renderToString(htmlObj);
    const { styles } = new CleanCSS().minify(css);
    sendContent(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta property="og:title" content="Can I Include">
            <meta property="og:description" content="'Can I Include' tool to help determine if one HTML tag can be included in another HTML tag">
            <meta property="og:image" content="https://cdn.glitch.com/19f7087b-7781-4727-9c59-2100bafabbf2%2Fsite-preview.png?v=1588606121865">
            <meta property="og:url" content="https://caninclude.glitch.me/">
            <meta name="twitter:card" content="summary_large_image">
            <meta property="og:site_name" content="Can I Include">

            <meta name="twitter:title" content="Can I Include">
            <meta name="twitter:description" content="'Can I Include' tool to help determine if one HTML tag can be included in another HTML tag">
            <meta name="twitter:image" content="https://cdn.glitch.com/19f7087b-7781-4727-9c59-2100bafabbf2%2Fsite-preview.png?v=1588606121865">
            <meta name="twitter:image:alt" content="Can I Include [main page]">
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
    const initialMatches = [...intersection];

    const { negativeKeywords } = parentTag.props.sections['ContentModel'];
    const { conditionalKeywords } = childTag.props.sections['Categories'];
    
    conditionalKeywords.forEach(el => {
        childKeyWordsSet.delete(el);
        intersection.delete(el);
    });

    const hasNegativeKeywords = new Set(negativeKeywords.filter(x => childKeyWordsSet.has(x)));
    if (hasNegativeKeywords.has(childFormatted) || hasNegativeKeywords.size) {
        return { type: 'No', fail: true, text: 'No, you can\'t!' };
    }

    if (parentKeyWordsSet.has('transparent')) {
        return { 
            type: 'Doubt',
            doubt: true,
            text: 'I doubt',
            message: messages.makeTransparentContentWarning(parentFormatted),
            matched: initialMatches,
            negative: new Set(negativeKeywords)
        };
    } else if (!intersection.size) {
        return {
            type: 'No', 
            fail: true, 
            text: 'No, you can\'t!', 
            matched: [] 
        };
    } else if (intersection.size) {
        return { 
            type: 'Yes', 
            success: true, 
            text: 'Yes, you can!', 
            matched: initialMatches,
            negative: new Set(negativeKeywords) 
        };
    }

    return { unknown: true, matched: [] };
}

function withCatch(cb) {
    return async function (req, res, next) {
        try {
            await cb(req, res, next);
        } catch (e) {
            return next(e);
        }
    }
}

const feedbackRouter = express.Router();
feedbackRouter.post('/new', [
    check('feedback').isLength({ min: 10, max: 280 }),
    check('parent').isLength({ min: 1 }),
    check('child').isLength({ min: 1 })
], withCatch(async (req, res, next) => {
    const { feedback, parent, child } = req.body;
    const currentUrl = req.header('Referer') || '/';
    const parentFormatted = parent.toLowerCase();
    const childFormatted = child.toLowerCase();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.redirect(currentUrl.href);
    }

    if (!db[parentFormatted] || !db[childFormatted]) return res.redirect(currentUrl.href);

    const { user } = req.session;
    if (user) {
        try {
            const canAdd = await feedbackManager.canAddFeedback(FeedbackDailyLimit);
            if (canAdd) {
                await feedbackManager.add({ user, text: feedback, parent: parentFormatted, child: childFormatted });
            }
        } catch (e) {
            req.session.messageKey = getMessageByError(e);
            return res.redirect(currentUrl);
        }
    }   

    const parsedUrl = url.parse(currentUrl, true);
    const searchParams = new URLSearchParams(parsedUrl.query);
    searchParams.delete('feedback');
    parsedUrl.search = searchParams.toString();
    res.redirect(url.format(parsedUrl));
}));


const cookieRouter = express.Router();
cookieRouter.get('/accept', (req, res) => {
    if (!req.session.user) {
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        req.session.user = `${uuidv4()}${clientIp.split(',')[0]}`;
        req.session.userAcceptCookie = true;
        res.redirect(req.header('Referer') || '/');
    }
});

const queryRouter = express.Router();
queryRouter.get('/include', [
    check('parent').isLength({ min: 1 }),
    check('child').isLength({ min: 1 })
], withCatch(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('/');
    }

    const { user } = req.session;
    const tips = [];
    const { parent, child, like, dislike, unlike, undislike, feedback, feedbacks } = req.query;
    let votes = null;
    const parentFormatted = parent.toLowerCase();
    const childFormatted = child.toLowerCase();
    
    const parentTag = db[parentFormatted];
    const childTag = db[childFormatted];
    if (!parentTag || !childTag) return res.redirect('/');
    const currentUrl = `?parent=${parentFormatted}&child=${childFormatted}`;

    if (user) {
        if (typeof like !== 'undefined') {
            await likeManager.like(user, parentFormatted, childFormatted);
        } else if (typeof dislike !== 'undefined') {
            await likeManager.dislike(user, parentFormatted, childFormatted);
        } else if (typeof unlike !== 'undefined') {
            await likeManager.unlike(user, parentFormatted, childFormatted);
        } else if (typeof undislike !== 'undefined') {
            await likeManager.undislike(user, parentFormatted, childFormatted);
        }
    }

    votes = await likeManager.votes(user, parentFormatted, childFormatted);

    const result = canInclude(childTag, parentTag, childFormatted, parentFormatted);
    const pairKey = `${childFormatted}|${parentFormatted}|${result.type}`.toLowerCase();
    updateSearchStatMap(pairKey);

    if (result.doubt) {
        tips.push({ messages: [result.message], type: 'warning' });
    }

    if (result.matched && result.matched.length) {
        tips.push({ messages: [
            messages.makeMatched(result.matched, parentFormatted, childFormatted, result.negative)
        ], type: 'info' });
    }

    const messageKey = req.session.messageKey;
    if (messageKey) {
        delete req.session.messageKey;
        tips.push({ 
            messages: [ErrorsCollection[messageKey]], 
            type: 'error'
        });
    }

    let canAddFeedback = true;
    try {
        await feedbackManager.canAddFeedback(FeedbackDailyLimit);
    } catch(e) {
        canAddFeedback = false;
    }

    const queryParams = { user, parent: parentFormatted, child: childFormatted };

    const props = { 
        form: { parent: parentFormatted, result, child: childFormatted }, 
        tags: [ childTag, result, parentTag ],
        tips,
        request: {
            count: counter.count,
            uniqCount: counter.uniqCount,
            url: currentUrl,
            user
        },
        specVersion,
        votes,
        userAcceptCookie: req.session.userAcceptCookie,
        showFeedback: typeof feedback !== 'undefined' && canAddFeedback,
        showFeedbacks: typeof feedbacks !== 'undefined',
        feedback: { 
            count: await feedbackManager.countByTags(queryParams),
        },
        feedbacks: await feedbackManager.getLastFeedbacks(queryParams),
        canAddFeedback
    };

    streamBody(req, res, props, css);
}));

function checkHttps(req, res, next) {
    if (!req.get('X-Forwarded-Proto') || req.get('X-Forwarded-Proto').indexOf("https") != -1) {
        return next()
    } else {
        res.redirect(`https://${req.hostname}${req.url}`);
    }
}

function countRequests(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.ip = ip;
    const { like, dislike, unlike, undislike } = req.query;
    if ([like, dislike, unlike, undislike].some(x => typeof x !== 'undefined')) return next();
    counter.register(ip.split(',')[0]);
    next();
}

app.use(cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY || 'not-for-production-cookie-key'],
    signed: true,
    overwrite: true,
    // Cookie Options
    maxAge: 10 * 365 * 24 * 60 * 60 * 1000 // 10 year
}));

app.all('*', checkHttps);
app.use(countRequests);
app.use(withCatch(function (req, res, next) {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const onlyClientIp = clientIp.split(',')[0];
    if (req.session.user && clientIp && (req.session.user.endsWith(clientIp) || req.session.user.endsWith(onlyClientIp))) {
        req.session.user = req.session.user.replace(clientIp, '').replace(onlyClientIp, '');
    }
    next();
}));

app.get('/', withCatch((req, res) => {
    const props = { 
        form: { parent: '', child: '' }, 
        tags: [],
        tagStats: [...searchStatMap].map(([result, count]) => {
            const [child, parent, canInclude] = result.split('|');
            return { child, parent, canInclude, count: shortenNumber(count) };
        }),
        request: {
            count: counter.count,
            uniqCount: counter.uniqCount
        },
        specVersion,
        userAcceptCookie: req.session.userAcceptCookie,
        showFeedback: undefined,
        showFeedbacks: undefined
    };
    streamBody(req, res, props, css);
}));

app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/can', queryRouter);
app.use('/cookies', cookieRouter);
app.use('/feedback', feedbackRouter);
app.use(async function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
});
app.use(async function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' });
    } else {
        next(err);
    }
});
app.use(async function errorHandler(err, req, res, next) {
    if (!err) {
        return next();
    }
    res.status(500);
    const refererUrl = req.header('Referer') || '/';
    const request = {
        count: counter.count,
        uniqCount: counter.uniqCount,
        url: refererUrl
    };

    streamPage(req, res, html`<${ErrorPage} request="${request}"/>`, css);
});

app.listen(port, async () => {
    console.warn('usedOlderVersion:', usedOlderVersion, 'current version:', process.version);
    console.warn('[i] Begin read database');
    const jsonDb = await readFile('./spec.json');
    css = await readFile('./components/App.css', { encoding: 'utf8' });
    const parsedDb = JSON.parse(jsonDb);
    specVersion = parsedDb.version;
    db = makeIndex(parsedDb);
    console.warn('[i] End of reading database');
    console.warn('[i] Begin read searchstat.json');
    const searchStat = await readFile('./searchstat.json');
    searchStatMap = makeSortedMap(JSON.parse(searchStat));
    counter.load().catch(e => console.warn(e.message));
    console.warn('[i] End of reading searchstat.json');
    console.log(`Example app listening at http://localhost:${port}`);
});