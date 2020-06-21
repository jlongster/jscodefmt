// @flow

let tests = [
  function(x: { y?: string }, z: () => string) {
    if (x.y) {
      // make sure we visit the AST in the correct order. if we visit z() before
      // x.y, then the function call will invalidate the refinement of x.y
      // incorrectly.
      x.y.indexOf(z()); // no error
    }
  },
];
