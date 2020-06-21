type Merge<T> = (a: T, b: T) => T;

// hypothetical immutable map
declare class Map<K,V> {
  (): Map<K,V>;
  insertWith(fn: Merge<V>, k: K, v: V): Map<K,V>;
}

declare function foldr<A,B>(fn: (a: A, b: B) => B, b: B, as: A[]): B;

function insertMany<K,V>(merge: Merge<V>, vs: [K,V][], m: Map<K,V>): Map<K,V> {
  function f([k,v]: [K,V], m: Map<K,V>): Map<K,V> {
    return m.insertWith(merge, k, v)
  }
  return foldr(f, m, vs)
}

class Foo<A> {
  bar<B>() {
    return function<C>(a: A, b: B, c: C): void {
      ([a,b,c] : [A,B,C]);
    }
  }
}
