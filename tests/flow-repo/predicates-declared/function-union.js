// @flow

declare function f1(x: mixed): boolean %checks(typeof x === "string");
declare function f2(x: mixed): boolean %checks(Array.isArray(x));

declare var cond: boolean;

// Feature check:
function foo(x: number | string | Array<string>): number {

  var f = (cond) ? f1 : f2;

  if (f(x)) {
    return x.length;
  } else {
    return 1;
  }
}
