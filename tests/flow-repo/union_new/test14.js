// @noflow

// annotations

declare class C<X> {
  get(): X;
}

function union(o: { x: string } | { x: number }) { }

function foo(c: C<number>) {
  union({ x: c.get() });
}
