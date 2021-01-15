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
};
