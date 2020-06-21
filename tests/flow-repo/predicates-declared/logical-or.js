// @flow

// Sanity check:
// - conditional functions do not affect behavior of conditional
//   expressions (e.g. `||`)

declare function r(x: string): number;
var s = 'a';
var n = r(s) || 1;
(n: number);

var x = "";
if (x = r(s) || 1) {
  (x: number);
}

declare var dollars: mixed;

function foo(x: mixed) { return 1; }
(foo(dollars) || 0);

(Number(dollars) || 0);
