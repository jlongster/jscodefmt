/* @flow */

function foo(x : ?number) {
  var y;
  if (y = x) {
    var z = y * 1000;
  }
}

type Bar = {
  parent: ?Bar;
  doStuff: () => void
}

function bar0(x : Bar) {
  while (x = x.parent) { // can't assign x to ?Bar
    x.doStuff();
  }
}

function bar1(x : ?Bar) {
  while (x = x.parent) { // x.parent might be null
    x.doStuff();
  }
}

function bar2(x : Bar) {
  var y = x;
  while (y = y.parent) {
    y.doStuff();
  }
}
