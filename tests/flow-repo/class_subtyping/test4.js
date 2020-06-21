class C<X> { x: X; }

function foo<X>(c: C<X>, x: X) { }

type O = { f: number };

foo((new C: C<O>), { f_: 0 });

class D extends C<O> {
  bar() { this.x; }
}

foo(new D, { f_: 0 });
