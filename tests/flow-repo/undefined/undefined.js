function foo() {
    var x;
    x.foo();
}

function bar() {
    var x:?{ bar():void; };
    if (x) x.bar();
}

function qux(x?: number, y:string = "", z) { }
