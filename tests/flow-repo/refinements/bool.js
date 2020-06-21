/* @flow */

function foo(x: ?bool) {
  if (x === false) {
    return;
  }

  if (x === true) {
    return;
  }

  x[0]; // error on null and undefined
}

function bar(x: ?bool) {
  if (x !== true) {
    if (x !== false) {
      x[0]; // error on null and undefined
    }
  }
}

function baz(x: ?bool) {
  if (100 * false) {
    return;
  }
  if (false * 100) {
    return;
  }
}

let tests = [
  function(x: { done: true, result: string } | { done: false }) {
    if (x.done === true) {
      return x.result;
    }
    return x.result; // error
  },

  function(x: { done: true, result: string } | { done: false }) {
    if (true === x.done) {
      return x.result;
    }
    return x.result; // error
  },
];
