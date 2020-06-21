/* @flow */

var foo = Object.freeze({bar: '12345'});
foo.bar = '23456'; // error

Object.assign(foo, {bar: '12345'}); // error

var baz = {baz: 12345};
var bliffl = Object.freeze({bar: '12345', ...baz});
bliffl.bar = '23456'; // error
bliffl.baz = 3456; // error
bliffl.corge; // error
bliffl.constructor = baz; // error
bliffl.toString = function() {}; // error

baz.baz = 0;

var x : number = Object.freeze(123);

var xx : { x: number } = Object.freeze({ x: "error" })
