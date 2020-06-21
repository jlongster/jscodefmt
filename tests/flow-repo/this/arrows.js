class C {
  foo() {
    return () => { return this.bar(); }; // OK, since this: C
  }
  bar() { return this; } // return type is C
}
var c = new C;
var f = c.foo();
var i = f(); // OK
(i: C); // OK

class D extends C { }
var d = new D;
var g = d.foo();
var j = g(); // OK
(j: D); // error, since return type of bar is C, not the type of `this`

class E {
  foo(x: number) { }
}
class F extends E {
  foo() { // OK to override with generalization
    (() => {
      super.foo(""); // find super method, error due to incorrect arg
    })();
  }
}
