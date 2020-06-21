class GeneratorExamples {
  *stmt_yield(): Generator<number, void, void> {
    yield 0; // ok
    yield ""; // error: string ~> number
  }

  *stmt_next(): Generator<void, void, number> {
    var a = yield;
    if (a) {
      (a : number); // ok
    }

    var b = yield;
    if (b) {
      (b : string); // error: number ~> string
    }
  }

  *stmt_return_ok(): Generator<void, number, void> {
    return 0; // ok
  }

  *stmt_return_err(): Generator<void, number, void> {
    return ""; // error: string ~> number
  }

  *infer_stmt() {
    var x: boolean = yield 0; // error: number ~> boolean
    return "";
  }

  *widen_next() {
    var x = yield 0;
    if (typeof x === "number") {
    } else if (typeof x === "boolean") {
    } else {
      (x : string) // ok, sherlock
    }
  }

  *widen_yield() {
    yield 0;
    yield "";
    yield true;
  }

  *delegate_next_generator() {
    function *inner() {
      var x: number = yield; // error: string ~> number
    }
    yield *inner();
  }

  *delegate_yield_generator() {
    function *inner() {
      yield "";
    }

    yield *inner();
  }

  *delegate_return_generator() {
    function *inner() {
      return "";
    }

    var x: number = yield *inner(); // error: string ~> number
  }

  // only generators can make use of a value passed to next
  *delegate_next_iterable(xs: Array<number>) {
    yield *xs;
  }

  *delegate_yield_iterable(xs: Array<number>) {
    yield *xs;
  }

  *delegate_return_iterable(xs: Array<number>) {
    var x: void = yield *xs // ok: Iterator has no yield value
  }

  *generic_yield<Y>(y: Y): Generator<Y,void,void> {
    yield y;
  }

  *generic_return<R>(r: R): Generator<void,R,void> {
    return r;
  }

  *generic_next<N>(): Generator<void,N,N> {
    return yield undefined;
  }
}

var examples = new GeneratorExamples();

for (var x of examples.infer_stmt()) { (x : string) } // error: number ~> string

var infer_stmt_next = examples.infer_stmt().next(0).value; // error: number ~> boolean
if (typeof infer_stmt_next === "undefined") {
} else if (typeof infer_stmt_next === "number") {
} else {
  (infer_stmt_next : boolean) // error: string ~> boolean
}

examples.widen_next().next(0)
examples.widen_next().next("")
examples.widen_next().next(true)

for (var x of examples.widen_yield()) {
  if (typeof x === "number") {
  } else if (typeof x === "boolean") {
  } else {
    (x : string) // ok, sherlock
  }
}

examples.delegate_next_generator().next("");

for (var x of examples.delegate_yield_generator()) {
  (x : number) // error: string ~> number
}

examples.delegate_next_iterable([]).next(""); // error: Iterator has no next value

for (var x of examples.delegate_yield_iterable([])) {
  (x : string) // error: number ~> string
}
