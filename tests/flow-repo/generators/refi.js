function *a(x: {a: void | string}): Generator<void, void, void> {
  if (!x.a) return;
  (x.a: string); // ok
  yield;
  (x.a: string); // error
}

function *b(x: void | string): Generator<void, void, void> {
  if (!x) return;
  (x: string); // ok
  yield;
  (x: string); // ok
}

declare function fn(): Generator<void, void, void>;

function *c(x: {a: void | string}): Generator<void, void, void> {
  const gen = fn();
  if (!x.a) return;
  (x.a: string); // ok
  yield * gen;
  (x.a: string); // error
}

function *d(x: void | string): Generator<void, void, void> {
  const gen = fn();
  if (!x) return;
  (x: string); // ok
  yield * gen;
  (x: string); // ok
}
