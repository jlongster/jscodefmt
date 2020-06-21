async function *delegate_next() {
  async function *inner() {
    var x: void = yield; // error: number ~> void
  }
  yield *inner();
}
delegate_next().next(0);

async function *delegate_yield() {
  async function *inner() {
    yield 0;
  }
  yield *inner();
}
(async () => {
  for await (const x of delegate_yield()) {
    (x: void); // error: number ~> void
  }
});

async function *delegate_return() {
  async function *inner() {
    return 0;
  }
  var x: void = yield *inner(); // error: number ~> void
}
