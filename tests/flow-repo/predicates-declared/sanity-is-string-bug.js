// @flow

declare function is_string(x: mixed): boolean %checks(typeof x === "string");
declare function is_number(x: mixed): boolean %checks(typeof x === "number");

// Sanity check:
// - Erroneous logic

function bar(x: string | Array<string>): string {
  if (is_number(x)) {
    return x;
  } else {
    return x.join();    // error: both string and Array<string> can flow to x
  }
}
