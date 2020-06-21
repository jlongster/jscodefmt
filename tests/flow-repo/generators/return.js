function test1(gen: Generator<void, string, void>) {
  // You can pass whatever you like to return, it doesn't need to be related to
  // the Generator's return type
  var ret = gen.return(0);
  (ret.value: void); // error: string | number ~> void
}

// However, a generator can "refuse" the return by catching an exception and
// yielding or returning internally.
function *refuse_return() {
  try {
    yield 1;
  } finally {
    return 0;
  }
}
var refuse_return_gen = refuse_return();
var refuse_return_result = refuse_return_gen.return("string");
if (refuse_return_result.done) {
  (refuse_return_result.value: string); // error: number | void ~> string
}
