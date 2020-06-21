declare class Array<T> {
    @@iterator(): Iterator<T>;
    map<U>(callbackfn: (value: T, index: number, array: Array<T>) => U, thisArg?: any): Array<U>;
}

type IteratorResult<Yield,Return> =
  | { done: true, value?: Return }
  | { done: false, value: Yield };

interface $Iterator<+Yield,+Return,-Next> {
    @@iterator(): $Iterator<Yield,Return,Next>;
    next(value?: Next): IteratorResult<Yield,Return>;
}
type Iterator<+T> = $Iterator<T,void,void>;

interface $Iterable<+Yield,+Return,-Next> {
    @@iterator(): $Iterator<Yield,Return,Next>;
}
type Iterable<+T> = $Iterable<T,void,void>;

declare class Map<K, V> {
    @@iterator(): Iterator<[K, V]>;
    constructor(iterable: ?Iterable<[K, V]>): void;
    set(key: K, value: V): Map<K, V>;
}
