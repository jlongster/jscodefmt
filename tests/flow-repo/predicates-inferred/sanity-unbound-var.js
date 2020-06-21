// @flow

declare var y: mixed;

// Sanity check: this should fail, because the preficate function
// checks `y` instead of `x`.
function err(x): %checks {
  return typeof y === "string";
}

function foo(x: string | Array<string>): string {
  if (err(x)) {
    return x;
  } else {
    return x.join();
  }
}
