// @flow

// from sam, https://github.com/facebook/flow/issues/780
// call to f() within if should properly havoc x.
//
function example(b: bool): number {
  var x = 0;
  function f() { x = "" }
  if (b) {
    f();
  }
  return x; // error, string ~/~> number (return type anno) TODO
}
