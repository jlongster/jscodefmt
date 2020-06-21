// @flow

// The original first-order case

function foo(x: string | Array<string>): string {
  if (typeof x === "string") {
    return x; // [ERROR] x: Array<string> doesn't match return type
  }
  else {
    return x.join(); // [ERROR] x: string doesn't have .join method
  }
}
