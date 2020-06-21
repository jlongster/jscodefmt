/* @flow */

declare class Bar<K> {
  update<K_>(updater: (value: this) => Bar<K_>): Bar<K_>;
}

declare function foo<U>(
  initialValue: U,
  callbackfn: (previousValue: U) => U
): U;

declare var items: Bar<string>;
declare var updater: (value: Bar<string>) => Bar<string>;

foo(
  items,
  (acc) => acc.update(updater)
);
