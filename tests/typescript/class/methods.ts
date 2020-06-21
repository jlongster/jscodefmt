class X {
    optionalMethod?() {}
}

interface Iterable<T> {
  export [Symbol.iterator](): Iterator<T>;
}

export class Check {
  private static property = 'test';
}
