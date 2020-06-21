async function *catch_return() {
  try {
    yield 0;
  } catch (e) {
    return e;
  }
}

(async () => {
  catch_return().throw("").then(({value}) => {
    if (value !== undefined) {
      (value: void); // error: number ~> void
    }
  });
});

async function *yield_return() {
  try {
    yield 0;
    return;
  } catch (e) {
    yield e;
  }
}

(async () => {
  yield_return().throw("").then(({value}) => {
    if (value !== undefined) {
      (value: void); // error: number ~> void
    }
  });
});
