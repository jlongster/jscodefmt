
/* @providesModule C */

var B = require('B');
var f = require('A').fn;

function C() {
  var o = new B();
  f(o.b);
  f(o.s);
  o.fn();
}

module.exports = C;
