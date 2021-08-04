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
    '--remote-debugging-port=9222',
  ],
  handleSIGINT: true,
  executablePath: 'google-chrome-stable',
  headless: true,
  slowMo: 0,
  dumpio: false,
};

(async function start() {
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto(Html5SpecURL, { waitUntil: 'load', timeout: 0 });
  const version = await page.$eval('#living-standard .pubdate', (el) => el.textContent);
  const result = await page.$$eval('h4[id^="the-"]~.element', (elements) => {
    function collectElements(el) {
      const foundElements = [];
      let parentNode = null;

      const treeWalker = document.createTreeWalker(
        el,
        // eslint-disable-next-line no-bitwise
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return ((
              node.nodeName === 'A' || (node.nodeName === '#text' && node.parentNode === parentNode)
            ) && NodeFilter.FILTER_ACCEPT) || NodeFilter.FILTER_SKIP;
          },
        },
      );

      parentNode = treeWalker.currentNode;
      let currentNode = treeWalker.nextNode();
      while (currentNode) {
        foundElements.push(currentNode.nodeName === 'A' ? { text: currentNode.innerText, href: currentNode.href, hashText: new URL(currentNode.href).hash } : currentNode.textContent);
        currentNode = treeWalker.nextNode();
      }

      return foundElements;
    }

    function nearest(element, selector) {
      if (!element) return null;
      if (element.matches(selector)) return element;
      if (!element.previousElementSibling) return null;
      return nearest(element.previousElementSibling, selector);
    }

    function parseTagNames(head) {
      return {
        href: head.querySelector('a').href,
        list: Array.from(head.querySelectorAll('code')).map((e) => e.innerText),
      };
    }

    function parseSection(section) {
      const bySectionName = (el) => ['Categories:', 'Content model:', 'Contexts in which this element can be used:'].includes(el.head);
      const normalize = (s) => (s.endsWith(':') ? s.slice(0, -1) : s);
      const capitalize = (s) => s.split(' ').map((p) => `${p.charAt(0).toUpperCase()}${p.slice(1)}`).join('');
      const toSectionObject = (o, el) => {
        o[capitalize(normalize(el.head))] = el.params;
        return o;
      };

      const accumulateSection = (accum, el) => {
        if (el.tagName === 'DT') {
          return accum.concat({ head: el.innerText, params: [] });
        }
        const keywords = Array.from(el.querySelectorAll('a')).map((a) => ({ text: a.innerText, href: a.href, hashText: new URL(a.href).hash }));
        // eslint-disable-next-line no-param-reassign
        accum[accum.length - 1].params = accum[accum.length - 1].params.concat({
          keywords, elements: collectElements(el), textContent: el.innerText,
        });
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
        tag: (strongElement && strongElement.nextSibling.textContent.trim()) || null,
        browsers: Array.from(el.querySelectorAll('span'))
          .map((span) => Array.from(span.querySelectorAll('span')).map((element) => element.innerText))
          .filter((arr) => arr && arr.length),
      };
    }

    function reduceSupport(data) {
      const sites = ['WebHTMLElement', 'WebAPI', 'caniuse'];
      const browsers = sites.reduce((accum, site) => {
        if (!data[site]) return accum;
        const siteBrowsers = data[site].support.browsers;
        // eslint-disable-next-line no-restricted-syntax
        for (const [siteBrowser] of siteBrowsers) {
          accum.add(siteBrowser);
        }
        return accum;
      }, new Set());

      const table = {};
      const cache = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const site of sites) {
        // eslint-disable-next-line no-restricted-syntax
        for (const browserName of browsers) {
          let supportBrowsers;
          if (data[site]) {
            supportBrowsers = cache[site] || Object.fromEntries(data[site].support.browsers);
            if (!cache[site]) cache[site] = supportBrowsers;
          }
          table[browserName] = table[browserName] || {};
          table[browserName][site] = table[browserName][site] || {};
          table[browserName][site] = (data[site] && supportBrowsers[browserName]) || '--';
        }
      }
      return table;
    }

    function getStatusesNearH4(h4) {
      const statuses = {};
      let currentNode = h4;

      const next = () => {
        currentNode = currentNode.nextElementSibling;
      };

      next();
      if (currentNode.matches && currentNode.matches('div.status')) {
        statuses.caniuse = {
          support: parseSupport(currentNode.querySelector('.support')),
        };
        next();
      }
      if (currentNode.matches && currentNode.matches('div.mdn-anno')) {
        const a = currentNode.querySelector('.feature a');
        statuses.WebHTMLElement = {
          link: a.href,
          name: a.innerText,
          support: parseSupport(currentNode.querySelector('.support')),
        };
        next();
      }
      if (currentNode.matches && currentNode.matches('div.mdn-anno')) {
        const a = currentNode.querySelector('.feature a');
        statuses.WebAPI = {
          link: a.href,
          name: a.innerText,
          support: parseSupport(currentNode.querySelector('.support')),
        };
      }

      return reduceSupport(statuses);
    }

    return elements.map((el) => {
      const h4 = nearest(el, 'h4');
      const statuses = getStatusesNearH4(h4);
      return {
        tags: parseTagNames(h4),
        props: parseSection(el),
        support: statuses,
      };
    });
  });
  await writeFileAsync('spec.json', JSON.stringify({ version, result }, ' ', 2));
  await browser.close();
}());
