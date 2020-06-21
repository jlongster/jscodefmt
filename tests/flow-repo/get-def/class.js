// @flow

class Foo {
  prop: ?string;
  #privateProp: number;
  fun(): void {
    this.#privateProp;
    this.#privateProp = 4;
  }
}

const foo = new Foo();
foo.prop;
foo.prop = null;
foo.fun();

if (foo.prop != null) {
  foo.prop;
}

function f(x: ?Foo): void {
  x.fun();
}

function f(x: Foo | null | void): void {
  x.fun();
}
