// You should be able to use an object as a function
function a(x: { (z: number): string }): (z: number) => string {
  return x;
}

// ...and it should notice when the return type is wrong
function b(x: { (z: number): string }): (z: number) => number {
  return x;
}

// ...or if the param type is wrong
function c(x: { (z: number): string }): (z: string) => string {
  return x;
}

// ...or if the arity is wrong
function d(x: { (z: number): string }): () => string {
  return x;
}

// ...or if it doesn't have a call property
function e(x: {}): () => string {
  return x;
}

// AnyFunT should also be allowed
function f(x: { (z: number): string }): Function {
  return x;
}

// ... but only if the object is callable
function g(x: {}): Function {
  return x; // error
}
