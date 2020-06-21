/* @flow */

var r: number = 0;
function foo<X>(x: X): X { r = x; return x; }
