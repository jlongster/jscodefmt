/**
 * @flow
 */

import typeof A from "./A.js";
import type {Foo, Bar as Baz} from "./A.js";

var A = require('./A.js');
var Foo = A.Foo;
var Baz = A.Bar;

// errors in prev block leave type bindings in place, so these are errors
var m = A;
var n = Foo;
var o = Baz;

// errors from value positions only
var a: Foo = new Foo();
var b: Foo = new A.Foo();
(new A.Bar(): Baz);
