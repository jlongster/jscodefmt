/* @flow */
var C = require('./C');
var x: number = C.foo;
var y: string = C.A;
C.A = false;
