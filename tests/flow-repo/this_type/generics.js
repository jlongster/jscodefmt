class Generic<X> {
  clone(): Generic<X> { return this; }
}

class Implicit<X> { arg: X; val: X; }
class ImplicitNumber extends Implicit { arg: number; }

(new ImplicitNumber().val: string) // error: number ~> string
