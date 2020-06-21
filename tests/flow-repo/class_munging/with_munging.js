/**
 * @flow
 */

class Foo {
  _method(): string {
    return 'this is private';
  }
}

class Bar extends Foo {
  test() {
    (this._method(): string); // error
  }
}
