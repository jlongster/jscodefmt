/* @flow */

class A {
  prop: string;
  method(): string {
    return "A";
  }
}

class B {
  test(): string {
    if (super.prop) { // super.prop doesn't exist
      return super.prop; // error, unknown type passed to string expected
    }
    return "B";
  }
}

class C extends A {
  test(): string {
    if (super.prop) {
      return super.prop; // OK
    }
    return "C";
  }
}
