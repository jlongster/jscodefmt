/*
 *
 * @flow
 */
class A {
  f(tainted : $Tainted<string>) {
    // The Tainted annotation should still flow.
    var safe = tainted;
    // This should give a warning.
    var loc : string = safe;
  }
}
