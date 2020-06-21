// Examples without `this` types (compare with examples below)

class Base {
  foo() { return this; }
  qux() { return new Base; }

  bar() { return this; }
  bar_caller() { return this.bar(); }
}

class Inherit extends Base { }

class Override extends Base {
  foo() { return this; } // OK
  qux() { return this; } // OK, too

  bar() { return new Override; } // OK (cf. error below)
}

class InheritOverride extends Override { }

(new Inherit().foo(): Base);
(new Inherit().foo(): Inherit); // error (cf. OK below)
((new Inherit(): Base).foo(): Base);
(new Override().foo(): Base);
(new Override().foo(): Override); // OK
((new Override(): Base).foo(): Base);

(new InheritOverride().bar_caller(): InheritOverride); // error
                                                       // blame flips below

// Examples with `this` types (compare with examples above)

class Base2 {
  foo(): this { return this; }
  qux(): Base2 { return new Base2; }

  bar(): this { return this; }
  bar_caller(): this { return this.bar(); }

  corge(that: this) { }
  grault(that: Base2) { }
}

class Inherit2 extends Base2 { }

class Override2 extends Base2 {
  foo(): this { return this; } // OK
  qux(): this { return this; } // OK, too

  bar(): Override2 { return new Override2; } // error (cf. OK above)
                                             // see exploit below

  corge(that: this) { } // error
                        // see exploit below
  grault(that: this) { } // error, too
}

class InheritOverride2 extends Override2 { }

(new Inherit2().foo(): Base2);
(new Inherit2().foo(): Inherit2); // OK (cf. error above)
((new Inherit2(): Base2).foo(): Base2);
(new Override2().foo(): Base2);
(new Override2().foo(): Override2); // OK
((new Override2(): Base2).foo(): Base2);

(new InheritOverride2().bar_caller(): InheritOverride2); // exploits error above

(new Override2(): Base2).corge(new Base2()); // exploits error above
