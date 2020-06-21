// @flow

// Adapted from https://github.com/facebook/flow/issues/3443

class A {
    f(...args: any[]) {}
}

class B extends A {
    f(...args) {
      this.f(...args);
    }
}

function foo(...args) {
  foo(1, ...args);
}
foo(123);
