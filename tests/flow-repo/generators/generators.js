function *stmt_yield(): Generator<number, void, void> {
  yield 0; // ok
  yield ""; // error: string ~> number
}

function *stmt_next(): Generator<void, void, number> {
  var a = yield;
  if (a) {
    (a : number); // ok
  }

  var b = yield;
  if (b) {
    (b : string); // error: number ~> string
  }
}

function *stmt_return_ok(): Generator<void, number, void> {
  return 0; // ok
}

function *stmt_return_err(): Generator<void, number, void> {
  return ""; // error: string ~> number
}

function *infer_stmt() {
  var x: boolean = yield 0;
  return "";
}
for (var x of infer_stmt()) { (x : string) } // error: number ~> string
var infer_stmt_next = infer_stmt().next(0).value; // error: number ~> boolean
if (typeof infer_stmt_next === "undefined") {
} else if (typeof infer_stmt_next === "number") {
} else {
  (infer_stmt_next : boolean) // error: string ~> boolean
}

function *widen_next() {
  var x = yield 0;
  if (typeof x === "number") {
  } else if (typeof x === "boolean") {
  } else {
    (x : string) // ok, sherlock
  }
}
widen_next().next(0)
widen_next().next("")
widen_next().next(true)

function *widen_yield() {
  yield 0;
  yield "";
  yield true;
}
for (var x of widen_yield()) {
  if (typeof x === "number") {
  } else if (typeof x === "boolean") {
  } else {
    (x : string) // ok, sherlock
  }
}

function *delegate_next_generator() {
  function *inner() {
    var x: number = yield; // error: string ~> number
  }
  yield *inner();
}
delegate_next_generator().next("");

function *delegate_yield_generator() {
  function *inner() {
    yield "";
  }

  yield *inner();
}
for (var x of delegate_yield_generator()) {
  (x : number) // error: string ~> number
}

function *delegate_return_generator() {
  function *inner() {
    return "";
  }

  var x: number = yield *inner(); // error: string ~> number
}

// only generators can make use of a value passed to next
function *delegate_next_iterable(xs: Array<number>) {
  yield *xs;
}
delegate_next_iterable([]).next(""); // error: Iterator has no next value

function *delegate_yield_iterable(xs: Array<number>) {
  yield *xs;
}
for (var x of delegate_yield_iterable([])) {
  (x : string) // error: number ~> string
}

function *delegate_return_iterable(xs: Array<number>) {
  var x: void = yield *xs // ok: Iterator has no yield value
}

function *generic_yield<Y>(y: Y): Generator<Y,void,void> {
  yield y;
}

function *generic_return<R>(r: R): Generator<void,R,void> {
  return r;
}

function *generic_next<N>(): Generator<void,N,N> {
  return yield undefined;
}

function *multiple_return(b) {
  if (b) {
    return 0;
  } else {
    return "foo";
  }
}
let multiple_return_result = multiple_return().next();
if (multiple_return_result.done) {
  (multiple_return_result.value: void); // error: number|string ~> void
}
