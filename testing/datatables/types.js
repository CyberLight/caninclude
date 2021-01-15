class DataTableObject extends global.DataTable {
  constructor(obj) {
    const keys = Object.keys(obj);
    const firstItemKeys = Object.keys(obj[keys[0]]);
    super(firstItemKeys);
    this.table = obj;
  }

  add(name) {
    super.add(Object.values(this.table[name]));
  }

  xadd(name) {
    super.xadd(Object.values(this.table[name]));
  }
}

module.exports = {
  DataTableObject,
};
