/* @flow */
var I = require("./test.js");

class C extends I.A {}

var x: I.A = new C();
var y: I.B = new C();
