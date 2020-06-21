interface I { xs: Array<this>; }
interface J { f(): J; }
class C {
  xs: Array<C>;
  f(): C { return this; }
}
function foo(c: C): I { return c; }
function bar(c: C): J { return c; }
