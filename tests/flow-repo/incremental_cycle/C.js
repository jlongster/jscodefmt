// @flow
var A = require ('./A');
import type B from './B';

class C extends A {
  b: B;
}

module.exports = C;
