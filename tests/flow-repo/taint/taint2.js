/*
 *
 * @flow
 */
class A {
  f(tainted : $Tainted<string>) {
    // This *should* give a warning.
    fakeDocument.location.assign(tainted);
  }
}
