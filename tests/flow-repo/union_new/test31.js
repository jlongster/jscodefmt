// @noflow

// make sure tuples are type arguments (as used e.g. when viewing maps as
// key/value iterables) work

interface SomeIterator<T> { }

interface SomeIterable<T> {
  it(): SomeIterator<T>;
}

declare class SomeMap<K,V> {
  it(): SomeIterator<[K,V]>;
  set(k: K, v: V): void;
}

declare class ImmutableMap<K,V> { }

declare function convert<K,V>(iter: SomeIterable<[K,V]>): ImmutableMap<K,V>;

function foo(): ImmutableMap<string, boolean> {
  const countersGlobalMap = new SomeMap();
  countersGlobalMap.set("", false);
  return convert(countersGlobalMap);
}
