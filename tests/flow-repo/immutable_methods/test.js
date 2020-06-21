class A {
    foo(): A { return this; }
}
class B extends A {
    foo(): B { return this; }
}
class C extends A {}
var a: A = new B();
a.foo = function(): C { return new C(); }
