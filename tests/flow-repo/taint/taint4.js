/*
 *
 * @flow
 */

var safe : string = "safe";
// This should be allowed.
var tainted : $Tainted<string> = safe

function f(x : $Tainted<any>) {
  // Should cause error.
  var y : any = x;
}
