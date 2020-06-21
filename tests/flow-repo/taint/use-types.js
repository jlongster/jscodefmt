/*
 * @flow
 */

// Should cause an error.
function foo (x : $Tainted<number>) {
  var should_fail : number = x * 42;
}
// Should cause an error.
function foo1 (x : $Tainted<{f: number}>) {
  var ok : number = x.f;
}
// Should cause an error.
function foo2 (o : {f (y:number):number}, t: $Tainted<number>) {
  return o.f(t);
}

function foo3 (x : $Tainted<{f: number}>) {
  var also_tainted : $Tainted<number> = x.f;
}
// Should cause an error.
function foo4 (a : $Tainted<Array<string>>) {
  var trusted : string = a[0];
}
// Type error.
function foo5 (a : $Tainted<Array<string>>) {
  var trusted_number : number = a[0];
}

function foo6 (a : $Tainted<Array<string>>) {
  var trusted : $Tainted<string> = a[0];
}
