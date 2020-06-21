
/* @providesModule D */

var f = require('A').fn;

function g():string { return this.i; }

var o = {fn: g, ...{}};
o.i = true;

var i = o.fn();
f(i);

module.exports = "D for dummy";
