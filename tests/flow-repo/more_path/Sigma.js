
/* @providesModule Sigma */

class A { a() {} }

class B extends A { b() {} }

class C extends B { c() {} }

function bar(x:B) {
  if (x instanceof A) {
    x.a();
    x.c(); // error
  } else {
    x++; // TODO no error? since unreachable (x: B implies x: A)
  }
}

function foo(x:A) {
  if (x instanceof C) {
    x.a();
    x.b();
    x.c();
    x.d(); // error
  } else {
    x.a();
    x.c(); // error
  }
}


class D { d() {} }

function baz(x:D) {
  if (x instanceof A) {
    // unreachable, TODO: this shouldn't throw
  }
}

module.exports = "sigma";
