class C {
  C() { }
  foo() { }
  static bar() { }
  qux() { this.constructor.x; }
}
C.x;
(new C).foo.x;
C.bar.x;

import {Foo} from './exports_optional_prop';
const foo = new Foo();
(foo.bar(): string); // error, could be undefined

function f(x) {
  (x.bar(): string); // error. caused by `f(foo)`; annotate x to track it down.
}
f(foo);
