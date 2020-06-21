// @flow
// Should cause an error.
function f(x : $Tainted<string>, y : $Tainted<number>) {
  var z : $Tainted<bool> = x < y;
}
// Should cause an error.
function f1(x : string, y : $Tainted<number>) {
  var z : $Tainted<bool> = x < y;
}
// Should cause an error.
function f2(x : $Tainted<string>, y : number) {
  var z : $Tainted<bool> = x < y;
}
// Note: We allow removing Taint when two tainted
// values are compared.
function f3(x : $Tainted<string>, y : string) {
  var z : bool = x < y;
}
