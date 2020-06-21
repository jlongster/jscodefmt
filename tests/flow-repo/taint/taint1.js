/*
 *
 * @flow
 */
class A {
  f(tainted : $Tainted<string>) {
    // This shouldn't give a warning (both are tainted)
    var also_tainted : $Tainted<string> = tainted;
  }
}
