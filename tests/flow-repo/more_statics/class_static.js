class B {
    static foo(): string { return ""; }
}

class C extends B {
    static bar(): string { return ""; }
}

var x: number = C.bar();
var y: number = C.foo();
