class C {
  foo<X>(x: X): X { return x; }
  foo_<X: number>(x: X): number { return x; }
  bar<X>(x: X): X { return x; }
  qux(x: number): number { return x; }
}
class D extends C {
  foo(x: number): number { return x; } // error (specialization, see below)
  foo_(x: number): number { return x; } // OK, but only because the overridden foo accepts no more than number and returns exactly number
  bar<X>(x: X): X { return x; } // OK
  qux<X>(x: X): X { return x; } // OK (generalization)
}
