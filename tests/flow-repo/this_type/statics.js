// supporting `this` type in statics

class A {
  static make(): this { // factory method, whose return type `this` (still)
                        // describes instances of A or subclasses of A: the
                        // meaning of the `this` type is not changed simply by
                        // switching into a static context
    return new this; // but in a static context, the value `this` is bound to
                     // the class, instead of instances of the class
  }
}
class B extends A { } // inherits statics method too, with `this` bound to the class

(A.make(): A); // OK
(B.make(): B); // OK
(B.make(): A); // OK
(A.make(): B); // error
