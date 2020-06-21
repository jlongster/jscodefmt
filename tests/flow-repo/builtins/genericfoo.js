class Foo<T> {
    x:T;
    self():Foo<T> { return this; }
    map<U>(callbackfn: () => U): Foo<U> { return new Foo(); }
    set(x:T): void { }
    get(): T { return this.x; }
}

module.exports = Foo;
