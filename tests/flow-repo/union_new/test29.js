// @noflow

// Make sure caching doesn't cause a spurious successful match (e.g., when a
// failed match is tried again). This may happen, e.g., when checking
// polymorphic definitions, where the same code may be checked multiple times
// with different instantiations.

type Row = { x: string };

declare class D<T> {
  reduce(
    callbackfn: (previousValue: T, currentValue: T) => T,
    initialValue: void
  ): T;
  reduce<U>(
    callbackfn: (previousValue: U, currentValue: T) => U,
    initialValue: U
  ): U;
}

class C {
  foo(
    rows: D<Row>,
    minWidth: number,
  ): number {
    return rows.reduce(
      (length, row) => 0,
      minWidth,
    );
  }
}
