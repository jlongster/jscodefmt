/* @flow */

class A {
  _property1: number;
  static _sProperty: number;

  constructor() {
    this._property1 = 5;
  }
  _method1(): number {
    return 1;
  }
  static _sMethod(): string {
    return "some string";
  }
}
A._sProperty = 48;

class B extends A {
  _property1: string;
  static _sProperty: string;

  constructor() {
    super();
    this._property1 = "another string";
  }
  _method1(): string {
    return "yet another string";
  }
  static _sMethod(): number {
    return 23;
  }
}
B._sProperty = "B._sProperty string";
