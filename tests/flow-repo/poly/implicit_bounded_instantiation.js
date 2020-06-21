// @flow

class Base {}
class Middle extends Base {}
class Child extends Middle {}

class C<T: Middle> {
  meth(a: T): T {
    return a;
  }
}

// T is implicitly (bounded by) Middle in constructor call if not provided.
// Explicit type arg is required in annotation - here a wildcard captures it.
var a: C<*> = new C();

a.meth(new Middle());
a.meth(new Child());
a.meth(42); // Error: number ~> Middle
a.meth(new Base()); // Error: Base ~> Middle
