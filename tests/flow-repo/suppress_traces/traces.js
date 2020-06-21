/*
 * The location marked with the FlowFixMe does not show up in the original
 * error but shows up in the flow check --traces 10 result. This test makes
 * sure that we don't suppress the error due to a location that only shows up
 * when --traces is turned on.
 */

// $FlowFixMe - Error unused suppression
function bar(): number { return 5; }

function foo(x: string) {
  return bar();
}

var a: string = foo('hi'); // error number ~> string
