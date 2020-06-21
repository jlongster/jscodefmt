// @flow

// Sanity check:
// - we should still be getting an error at the second return statement

declare function pred<T>(x: T): boolean;

function foo(s: Array<string>): string {
  if (pred(s)) {
    return "1";
  }
  return 1;
}
