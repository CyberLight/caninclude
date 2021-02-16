const moment = require('moment');
const { DataTableObject } = require('../types');

module.exports = {
  recommendationsByParentTag: new DataTableObject({
    'Recommends most viewed at the same created date': {
      historyItems: [
        {
          child: 'span', parent: 'h1', count: 1, canInclude: 'yes', created: moment().format('YYYY-MM-DD'),
        },
        {
          child: 'span', parent: 'h2', count: 2, canInclude: 'yes', created: moment().format('YYYY-MM-DD'),
        },
      ],
      recommendationText: 'Also looking at this pair of tags <span/> inside <h2/>',
    },
    'Recommends most viewd tag but older': {
      historyItems: [
        {
          child: 'span', parent: 'h1', count: 2, canInclude: 'yes', created: moment().add(-1).format('YYYY-MM-DD'),
        },
        {
          child: 'span', parent: 'h2', count: 1, canInclude: 'yes', created: moment().format('YYYY-MM-DD'),
        },
      ],
      recommendationText: 'Also looking at this pair of tags <span/> inside <h1/>',
    },
  }),
  tagPairs: new DataTableObject({
    'img inside button': {
      child: 'img',
      parent: 'button',
      resultSectionImg: 'result_yes.png',
    },
    'a inside a': {
      child: 'a',
      parent: 'a',
      resultSectionImg: 'result_no.png',
    },
    'a inside label': {
      child: 'a',
      parent: 'label',
      resultSectionImg: 'result_yes.png',
    },
    'img inside a': {
      child: 'img',
      parent: 'a',
      resultSectionImg: 'result_doubt.png',
    },
    'label inside a': {
      child: 'label',
      parent: 'a',
      resultSectionImg: 'result_no.png',
    },
  }),
};
