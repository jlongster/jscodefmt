// Ensure method type params properly shadow outer type params. Subclass ensures
// the generated insttype has the correct tvars. Should behave the same for
// classes, interfaces, and declared classes.

class A<T> {
  x:T;
  constructor(x:T) { this.x = x }
  m<T>(x:T):A<T> { return new A(x) }
}

class B<T> extends A<T> {
  m<T>(x:T):B<T> { return new B(x) }
}

interface C<T> {
  m<T>(x:T):C<T>;
}

interface D<T> extends C<T> {
  m<T>(x:T):D<T>;
}

declare class E<T> {
  m<T>(x:T):E<T>;
}

declare class F<T> extends E<T> {
  m<T>(x:T):F<T>;
}


// Bounds can refer to parent type params (until they are shadowed).

class G<T> {
  x:T;
  constructor(x:T) { this.x = x }
  m<T:T>(x:T):G<T> { return new G(x) } // T-as-bound is G's T
}

declare var g: G<number|string>;
g.m(0); // ok
g.m(true); // err, bool ~> number|string
(g.m(""): G<number>); // err, string ~> number


// Shadow bounds incompatible with parent

class H<T> {
    x:T;
    m<T>(x:T) {
        this.x = x; // err, m's T != H's T
    }
}
