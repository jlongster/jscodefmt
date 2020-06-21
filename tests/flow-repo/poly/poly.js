class Foo<T> {
    x:T;
    constructor(x:T) { this.x = x; }
}

function bar<S>(foo:Foo<S>,y:S):Foo<S> { return new Foo(y); }

var P = {
    bar: bar
}

declare var Q: {
    bar<S>(foo:Foo<S>,y:S):Foo<S>;
}

var foo = new Foo(0);
var x:string = foo.x;
var z:Foo<number> = Q.bar(foo,"");
