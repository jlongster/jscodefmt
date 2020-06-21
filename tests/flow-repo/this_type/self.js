class A {
  foo() { return this; } // return of foo is not annotated to get around
                         // substituting this below
  bar(): this { return new A().foo(); } // same as returning : A, so error
  qux(): this { return this.bar(); } // OK (don't cascade errors)
}
