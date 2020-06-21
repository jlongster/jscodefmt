/* @flow */

class A {
  x: {[k:string]: number};

  m1() {
    this.x = { bar: 0 }; // no error
  }

  m2() {
    this.x.foo = 0; // no error
  }
}

class B {
  x: {[k:string]: number};

  m2() {
    this.x.foo = 0; // no error
  }

  m1() {
    this.x = { bar: 0 }; // no error
  }
}
