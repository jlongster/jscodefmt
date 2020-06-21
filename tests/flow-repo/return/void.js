/* This is a regression test. At one point we incorrectly inferred the return
   type of functions that have an explicit `undefined` to be only `undefined` --
   ignoring other possible exits. */
function f(b) {
  if (b) {
    return undefined;
  } else {
    return "nope";
  }
}

(f(true): void); // error: string ~> void
