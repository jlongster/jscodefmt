declare class Set<T> {
    add(x: any): Set<T>;
}

declare class Row {
    reduce_row(
      callbackfn: (previousValue: number, currentValue: number) => number,
      initialValue: void
    ): number;
    reduce_row<U>(
      callbackfn: (previousValue: U, currentValue: number) => U,
      initialValue: U
    ): U;
}

declare class Rows {
    reduce_rows<X>(
      callbackfn: (previousValue: X, currentValue: Row) => X,
      initialValue: X
    ): X;
}
