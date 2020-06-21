
/* @providesModule B */

var A = require('A').cls;

function B() {
  this.b = "...";
}

function f():number { return this.b; }

B.prototype.s = 0;
B.prototype.fn = f;

module.exports = B;
