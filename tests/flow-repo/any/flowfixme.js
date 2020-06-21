/*
  FlowFixMe is a synonym for any, used by the Flow team to
  signal a needed mod to JS devs.

  @flow
 */

// no param
function foo(x:$FlowFixMe):$FlowFixMe { return x; }
function bar(x:$FlowFixMe):mixed { return x; }
// param (info only)
function qux(x:$FlowFixMe<number>):$FlowFixMe<number> { return x; }
// ...params are still checked. unknown type
function baz(x:$FlowFixMe<nnumber>): $FlowFixMe<number> { return x; }

var x:string = foo(0);
var y:string = bar(0);
var z:string = qux(0);
var w:string = baz(0);
