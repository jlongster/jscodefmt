// @flow

import { C, E } from "./b0";
function foo() { return C; }
function bar() { return E; }
let X = foo();
class F extends X { }
class D extends F { }
module.exports = { C, D };
