// Multiple call properties should also be supported
function a(f: { (): string; (x: number): string }): string {
  return f() + f(123);
}

// It should be fine when a function satisfies them all
var b: { (): string; (x: number): string } =
  function (x?: number): string { return "hi"; };

// ...but should notice when a function doesn't satisfy them all
var c: { (): string; (x: number): string } =
  function (x: number): string { return "hi"; };

// Only one call property needs to match the function
function d(x: { (): string; (x: number): string }): () => string {
  return x;
}

// ...but you need at least one
function e(x: { (): string; (x: number): string }): () => number {
  return x;
}
