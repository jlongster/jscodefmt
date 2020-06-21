
/* @providesModule A */

module.exports = {};

var A = {x:true, ...{}};
module.exports.cls = A;

function f(x:boolean) { }
module.exports.fn = f;

A.y = "?";
A.x = A.y;
f(A.x); // A.x is now a string, by def assign
