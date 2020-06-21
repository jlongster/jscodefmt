/* @flow */

function foo(x: ?bool) {
  if (!x) {
    x++; // should error for null, void and bool (false)
  }
}

function bar(x: ?number) {
  if (!x) {
    x[0]; // should error for null, void and number (0)
  }
}

function baz (x: ?number) {
  if (x === null || x === undefined) {
    return;
  }

  if (!x) {
    x[0]; // should error for number (0)
  }
}

class TestClass {}

let tests = [
  function() {
    var y = true;
    while (y) {
      y = !y;
    }
  },
  function(x: Function) {
    (!x: false); // ok, functions are always truthy
  },
  function(x: Object) {
    (!x: false); // ok, objects are always truthy
  },
  function(x: string) {
    (!x: false); // error, strings are not always truthy
  },
  function(x: number) {
    (!x: false); // error, numbers are not always truthy
  },
  function(x: boolean) {
    (!x: false); // error, bools are not always truthy
  },
  function(x: TestClass) {
    (!x: false); // ok, classes are always truthy
  },
];
