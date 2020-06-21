/**
 * @flow
 */

import typeof A from "./A.js";
import type {Foo, Bar as Baz} from "./A.js";

var actualA = require('./A.js');

// You can't use it as an identifier
var m = A;
var n = Foo;
var o = Baz;

// But using it in a type should still work
var a: Foo = new actualA.Foo();
(new actualA.Bar(): Baz);
