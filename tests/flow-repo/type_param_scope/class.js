class C<T> {
  a<A>(x:T, a:A) {
    this.b(x); // ok
    this.b(a); // error: A ~> incompatible instance of T
  }

  b(x:T) {}
}
