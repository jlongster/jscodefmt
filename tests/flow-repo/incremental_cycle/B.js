// @flow
var A = require ('./A');
import type C from './C';

class B extends A {
  c: C;
}

module.exports = B;
