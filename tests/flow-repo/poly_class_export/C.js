// @flow

// This test exports a function whose return type is the class's `this` type.
// It should be inferred (no annotation required).

class Foo {
  foo(): this {
    return this;
  }
}

export function f(x: Foo) {
  return x.foo();
}
