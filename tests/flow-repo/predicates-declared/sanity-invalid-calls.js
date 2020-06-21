// @flow

// Sanity check:
// - invalid calls at predicate positions

declare function pred<T>(x: T): boolean;

function foo(s: Array<string>): string {

  if ((1)(s)) {
    return "1";
  }

  if ((pred + 1)("s")) {
    return "1";
  }

  return "1"
}
