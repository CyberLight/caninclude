// const { I } = inject();

module.exports = {
  helpers: {
    detailUrl(item) {
      return `/can/include/?child=${item.child}&parent=${item.parent}`;
    },
  },
  // insert your locators and methods here
};
