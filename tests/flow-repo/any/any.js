// @flow

function foo(x:any):any { return x; }
function bar(x:any):mixed { return x; }
function qux(x:mixed):any { return x; }

var x:string = foo(0);
var y:string = bar(0);
var z:string = qux(0);
