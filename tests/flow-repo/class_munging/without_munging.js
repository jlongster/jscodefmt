/**
 * @flow
 * @preventMunge
 */

class Foo {
  _method(): string {
    return 'this is not private';
  }
}

class Bar extends Foo {
  test() {
    (this._method(): string); // ok
  }
}
