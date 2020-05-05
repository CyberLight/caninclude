const fs = require('fs');
const util = require('util');
const writeFileAsync = util.promisify(fs.writeFile);

const puppeteer = require('puppeteer');
const ViewPort = [1920, 1080];
const Html5SpecURL = 'https://html.spec.whatwg.org/#the-html-element';

const options = {
    args: [
        `--window-size=${ViewPort}`,
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--remote-debugging-address=0.0.0.0',
        '--remote-debugging-port=9222'
    ],
    handleSIGINT: true,
    executablePath: 'google-chrome-stable',
    headless: true,
    slowMo: 0,
    dumpio: false
};

!async function start() {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.goto(Html5SpecURL);
    const version = await page.$eval('#living-standard .pubdate', el => el.textContent);
    const result = await page.$$eval('h4[id^="the-"]~.element', elements => {
        function nearest(element, selector) {
            if (!element) return null;
            if (element.matches(selector)) return element;
            if (!element.previousElementSibling) { return null }
            else return nearest(element.previousElementSibling, selector);
        }
        function parseTagNames(head) {
            return {
                href: head.querySelector('a').href,
                list: Array.from(head.querySelectorAll('code')).map(e => e.innerText)
            };
        }
        function parseSection(section) {
            const bySectionName = el => ['Categories:', 'Content model:', 'Contexts in which this element can be used:'].includes(el.head);
            const normalize = s => s.endsWith(':') ? s.slice(0, -1) : s;
            const capitalize = s => s.split(' ').map(p => `${p.charAt(0).toUpperCase()}${p.slice(1)}`).join('')
            const toSectionObject = (o, el) => {
                o[capitalize(normalize(el.head))] = el.params;
                return o;
            };

            const accumulateSection = (accum, el) => {
                if (el.tagName === 'DT') {
                    return accum.concat({ head: el.innerText, params: [] });
                }
                const keywords = Array.from(el.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
                accum[accum.length - 1].params = accum[accum.length - 1].params.concat({ keywords, textContent: el.innerText});
                return accum;
            };

            return Array.from(section.children)
                        .reduce(accumulateSection, [])
                        .filter(bySectionName)
                        .reduce(toSectionObject, {});
        }

        function parseSupport(el) {
            if (!el) return null;
            const strongElement = el.querySelector('strong');
            return {
                tag: strongElement && strongElement.nextSibling.textContent.trim() || null,
                browsers: Array.from(el.querySelectorAll('span'))
                        .map(span => Array.from(span.querySelectorAll('span')).map(span => span.innerText)) 
                        .filter(arr => arr && arr.length)
            }
        }

        function reduceSupport(data) {
            const sites = ['WebHTMLElement', 'WebAPI', 'caniuse'];
            const browsers = sites.reduce((browsers, site) => {
                if (!data[site]) return browsers;
                const siteBrowsers = data[site].support.browsers;
                for (let [browser,] of siteBrowsers) {
                    browsers.add(browser)
                }
                return browsers;
            }, new Set());

            const table = {};
            const cache = {};
            for (const site of sites) {
                for (const browser of browsers) {
                    let supportBrowsers;
                    if (data[site]) {
                        supportBrowsers = cache[site] || Object.fromEntries(data[site].support.browsers);
                        if (!cache[site]) cache[site] = supportBrowsers;
                    }
                    table[browser] = table[browser] || {};
                    table[browser][site] = table[browser][site] || {};
                    table[browser][site] = data[site] && supportBrowsers[browser] || '--';
                }
            }
            return table;
        }

        function getStatusesNearH4(h4) {
            const result = {};
            let currentNode = h4;

            const next = () => {
                currentNode = currentNode.nextElementSibling;
            }

            next();
            if (currentNode.matches && currentNode.matches('div.status')) {
                result['caniuse'] = {
                    support: parseSupport(currentNode.querySelector('.support'))
                }
                next();
            } 
            if (currentNode.matches && currentNode.matches('aside.mdn-anno')) {
                const a = currentNode.querySelector('.feature a');
                result['WebHTMLElement'] = {
                    link: a.href,
                    name: a.innerText,
                    support: parseSupport(currentNode.querySelector('.support'))
                }
                next();
            }
            if (currentNode.matches && currentNode.matches('aside.mdn-anno')) {
                const a = currentNode.querySelector('.feature a');
                result['WebAPI'] = {
                    link: a.href,
                    name: a.innerText,
                    support: parseSupport(currentNode.querySelector('.support'))
                }
            }

            return reduceSupport(result);
        }

        return elements.map(el => {
            const h4 = nearest(el, 'h4');
            const statuses = getStatusesNearH4(h4);
            return {
                tags: parseTagNames(h4),
                props: parseSection(el),
                support: statuses
            }
        });
    });
    await writeFileAsync('spec.json', JSON.stringify({ version, result }, ' ', 2));
    await browser.close();
}();