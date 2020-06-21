// Counterexample with contravariant this type

class C {
  next: this; // error (see below for exploit): `this` should only appear in
              // covariant positions
}

class D extends C { }

var d = new D();
(d: C).next = new C;
(d.next: D); // sneaky

class A {
  foo<X: this>(that: X) { } // error: can't hide contravariance using a bound
}

class B extends A {
  foo<Y: this>(that: Y) { } // error (see above, catches hidden override)
}

// covariance checks on this type in invariant positions

class Invariant {
  out_object(): { _: this } { return { _: this }; }
  in_object(_: { _: this }) { }
  inout_object: { _: this };

  out_array(): Array<this> { return [this]; }
  in_array(_: Array<this>) { }
  inout_array: Array<this>;
}

// covariance checks on this type as type args

class Misc {
  // Set<X> has invariant X
  out_set(): Set<this> { return new Set().add(this); }
  in_set(_: Set<this>) { }
  inout_set: Set<this>;

  // Promise<X> has covariant X
  async out_promise(): Promise<this> { return this; }
  in_promise(_: Promise<this>) { }
  inout_promise: Promise<this>;

  // Generator<X,Y,Z> has covariant X, covariant Y, contravariant Z
  *out_generator(): Generator<this,this,this> {
    yield this;
    return this;
  }
  in_generator(_: Generator<this,this,this>) { }
  inout_generator: Generator<this,this,this>;
}
