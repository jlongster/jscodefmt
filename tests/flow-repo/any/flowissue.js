/*
  $FlowIssue is a synonym for any, used by JS devs to signal
  a potential typechecker bug to the Flow team.

  @flow
 */

// no param
function foo(x:$FlowIssue):$FlowIssue { return x; }
function bar(x:$FlowIssue):mixed { return x; }
// param (info only)
function qux(x:$FlowIssue<number>):$FlowIssue<number> { return x; }
// ...params are still checked. unknown type
function baz(x:$FlowIssue<nnumber>): $FlowIssue<number> { return x; }

var x:string = foo(0);
var y:string = bar(0);
var z:string = qux(0);
var w:string = baz(0);
