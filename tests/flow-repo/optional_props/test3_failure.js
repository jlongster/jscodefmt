// generalization of failure in test3.js

class A<O: {x: { a: number, b?: string}}> {
  o: O;
  foo() {
    this.o.x = { a: 123 };
    this.o.x.b = 'hello'; // this is a spurious error (see test3.js for details)
  }
}
