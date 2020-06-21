// You should be able to call objects with call properties
function a(f: { (): string }, g: { (x: number): string } ): string {
  return f() + g(123);
}

// ...and get an error if the return type is wrong
function b(f: { (): string }): number {
  return f();
}

// ...or if the param type is wrong
function c(f: { (x: number): number }): number {
  return f("hello");
}

// ...or if the arity is wrong
function d(f: { (x: number): number }): number {
  return f();
}

// ...or if there is no call property
function e(f: {}): number {
  return f();
}

// Make sure we complain even if the object literal is unsealed.
function f(): number {
  var x = {};
  return x();
}
