// @noflow

// constructor overloads

function m<X>() {
  return new D();
}

declare class D {
  constructor(_: void): void;
  constructor(_: null): void;
}
