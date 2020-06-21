declare var gen: AsyncGenerator<void,string,void>;

// You can pass whatever you like to return, it doesn't need to be related to
// the AsyncGenerator's return type
gen.return(0).then(result => {
  (result.value: void); // error: string | number ~> void
});

// However, a generator can "refuse" the return by catching an exception and
// yielding or returning internally.
async function *refuse_return() {
  try {
    yield 1;
  } finally {
    return 0;
  }
}
refuse_return().return("string").then(result => {
  if (result.done) {
    (result.value: string); // error: number | void ~> string
  }
});
