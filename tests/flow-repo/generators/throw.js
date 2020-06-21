function *catch_return() {
  try {
    yield 0;
  } catch (e) {
    return e;
  }
}

var catch_return_value = catch_return().throw("").value;
if (catch_return_value !== undefined) {
  (catch_return_value : string); // error: number ~> string
}

function *yield_return() {
  try {
    yield 0;
    return;
  } catch (e) {
    yield e;
  }
}
var yield_return_value = yield_return().throw("").value;
if (yield_return_value !== undefined) {
  (yield_return_value: string); // error: number ~> string
}
