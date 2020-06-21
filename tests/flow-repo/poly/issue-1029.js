// @flow

// naive unification causes combinatorial explosion here,
// effectively hangs

declare type Box<T> = {
  map1<U>(f: (x: T) => U): Box<U>;
  map2<U>(f: (x: T) => U): Box<U>;
  map3<U>(f: (x: T) => U): Box<U>;
  map4<U>(f: (x: T) => U): Box<U>;
  map5<U>(f: (x: T) => U): Box<U>;
}

declare var bool: Box<boolean>;

declare function unbox<A>(box: Box<A>): A

unbox(bool);
