// @flow

/**
 * test nested-promise unwrapping.
 * Note: currently we don't do this properly in the underlying
 * type of the Promise class, which causes spurious errors to
 * be raised here. Once that's fixed, the errors here will go
 * away.
 */

async function foo() {
  return 42;
}

async function bar() {
  return foo();
}

async function baz() {

  // a should now be typed as number, but is in fact
  // Promise<number> until nested-promise unwrap is fixed
  var a = await bar();

  // TODO this is valid code, but currently gives Promise ~> number error
  // due to lack of transitive Promise unwrap.
  var b: number = a;

  // should be number ~> string error, but currently gives
  // Promise ~> string error for the same reason
  var c: string = a;
}
