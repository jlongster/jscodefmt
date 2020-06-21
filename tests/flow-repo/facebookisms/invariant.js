/* @flow */

let tests = [
  function() {
    let x: ?string = null;
    invariant(x, 'truthy only'); // error, forgot to require invariant
  },

  function(invariant: Function) {
    let x: ?string = null;
    invariant(x);
    (x: string);
  }
]
