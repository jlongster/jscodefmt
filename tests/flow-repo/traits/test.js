declare class Foo extends Qux<string> mixins Bar<number> {
  // KeyedCollection <: Collection
  // ...KeyedIterable
}
declare class Bar<T> extends Baz<T> {
  // KeyedIterable <: Iterable
  y: T
}
declare class Qux<T> extends Baz<T> {
  // Collection <: Iterable
  y: T, z: T
}
declare class Baz<T> {
  // Iterable
  x: T
}

((new Foo).x: number); // error: Qux wins
((new Foo).y: string); // error: Bar wins
((new Foo).z: number); // error: Qux wins
