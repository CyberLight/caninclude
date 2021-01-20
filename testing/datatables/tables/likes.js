const { DataTableObject } = require('../types');

module.exports = {
  likesTable: new DataTableObject({
    'One like': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'like' },
      ],
      expectedCountRows: 1,
      expectedRows: [
        ['span', 'div', '1', 'result'],
      ],
    },
    'More than one like': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'like' },
        { parent: 'div', child: 'span', type: 'like' },
        { parent: 'div', child: 'span', type: 'like' },
      ],
      expectedCountRows: 1,
      expectedRows: [
        ['span', 'div', '3', 'result'],
      ],
    },
    'Equal count of likes and dislikes': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'like' },
        { parent: 'div', child: 'span', type: 'dislike' },
      ],
      expectedCountRows: 0,
      expectedRows: [],
    },
    'No likes': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'dislike' },
      ],
      expectedCountRows: 0,
      expectedRows: [],
    },
  }),

  dislikesTable: new DataTableObject({
    'One dislike': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'dislike' },
      ],
      expectedCountRows: 1,
      expectedRows: [
        ['span', 'div', '1', 'result'],
      ],
    },
    'More than one dislike': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'dislike' },
        { parent: 'div', child: 'span', type: 'dislike' },
        { parent: 'div', child: 'span', type: 'dislike' },
      ],
      expectedCountRows: 1,
      expectedRows: [
        ['span', 'div', '3', 'result'],
      ],
    },
    'Equal count of likes and dislikes': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'like' },
        { parent: 'div', child: 'span', type: 'dislike' },
      ],
      expectedCountRows: 0,
      expectedRows: [],
    },
    'No dislikes': {
      actualRows: [
        { parent: 'div', child: 'span', type: 'like' },
      ],
      expectedCountRows: 0,
      expectedRows: [],
    },
  }),
};
