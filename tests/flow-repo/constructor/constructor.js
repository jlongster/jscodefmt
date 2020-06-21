class C {
    constructor() { }
}

class D {
    constructor():number { }
}

// the return type of a constructor overrides the type of the class
declare class Bar<T> {}
declare class Foo<T> {
  constructor<U>(iterable: U): Bar<U>;
}
(new Foo('x'): Bar<string>); // ok
(new Foo(123): Bar<string>); // error, number !~> string

// also overrides when it returns a different specialization of the same class
declare class Baz<T> {
  constructor<U>(iterable: U): Baz<U>;
}
(new Baz('x'): Baz<string>); // ok
(new Baz(123): Baz<string>); // error, number !~> string
