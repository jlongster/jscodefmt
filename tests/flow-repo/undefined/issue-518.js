function doSomethingAsync(): Promise<void> {
  return new Promise((resolve, reject) => {
    resolve(); // OK to leave out arg, same as resolve(undefined)

    var anotherVoidPromise: Promise<void> = Promise.resolve();
    resolve(anotherVoidPromise);
  });
}

// simpler repro to show that too few args are fine when expecting void
function foo(x: void) { }
foo();
