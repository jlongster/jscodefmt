// https://babeljs.io/docs/en/babel-plugin-proposal-optional-catch-binding

try {
  throw 0;
} catch {
  doSomethingWhichDoesNotCareAboutTheValueThrown();
}

try {
  throw 0;
} catch {
  doSomethingWhichDoesNotCareAboutTheValueThrown();
} finally {
  doSomeCleanup();
}
