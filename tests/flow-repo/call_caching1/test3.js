// @flow

declare class ImmBox<T> {
  static <U>(x: any): ImmBox<U>;
  static (x: any): any;
}

declare class Box<T> {
  constructor(x: T): void;
  set(value: T): void;
  get(): T;
}

const outer = new Box();
const inner = outer.get();
outer.set(ImmBox(inner));
