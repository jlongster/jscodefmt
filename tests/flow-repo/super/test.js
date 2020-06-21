var D = require('./import');
class C extends D {
  constructor() { return super(); }
  foo() { return super.foo(); }
}
module.exports = C;
