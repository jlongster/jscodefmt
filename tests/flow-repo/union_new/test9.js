// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

////////////////
// interference
////////////////

function square(x? = 0) {
  return x * x;
}

function foo(f: ((_: ?number) => ?number) | (() => void)) { }
foo((x): number => square(x))
