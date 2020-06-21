/* @flow */

function g(x:string) { }

//function f(x) { g(x); return x; }
//function f(x:number) { g(x); return x; }
function f(x:number):number { g(x); return x; }

module.exports = f;
