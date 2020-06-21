// @flow

function f(x : $Tainted<number>, y : $Tainted<number>) {
  var z : $Tainted<number> = x + y;
}
function f1(x : $Tainted<number>, y : number) {
  var z : $Tainted<number> = x + y;
}
function f2(x : number, y : $Tainted<number>) {
  var z : $Tainted<number> = x + y;
}
// This should cause an error.
function f3(x : $Tainted<number>, y : number) {
  var z : number = x + y;
}
// This should cause an error.
function f4(x : number, y : $Tainted<number>) {
  var z : number = x + y;
}
// This should cause an error.
function f5(x : number, y : $Tainted<number>) {
  var z : string = x + y;
}
// This should cause an error.
function f6(x : string, y : $Tainted<number>) {
  var z : string = x + y;
}
// This should cause an error.
function f7(x : $Tainted<string>, y : $Tainted<number>) {
  var z : string = x + y;
}
