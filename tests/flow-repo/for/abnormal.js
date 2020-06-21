/* @flow */

function foo(x: boolean) {
  var max = 10;
  for (var ii = 0; ii < max; ii++) {
    if (x) {
      continue;
    }
    return;
  }
  console.log('this is still reachable');
}

function bar(x: boolean) {
  var max = 0;
  for (var ii = 0; ii < max; ii++) {
    return;
  }
  console.log('this is still reachable');
}

function baz(x: boolean) {
  var max = 0;
  for (var ii = 0; ii < max; ii++) {
    continue;
  }
  console.log('this is still reachable');
}

function bliffl(x: boolean) {
  var max = 10;
  loop1: for (var ii = 0; ii < max; ii++) {
    loop2: for (var jj = 0; jj < max; jj++) {
      break loop1;
    }
    console.log('this is still reachable');
  }
  console.log('this is still reachable');
}

function corge(x: boolean) {
  var max = 0;
  for (var ii = 0; ii < max; ii++) {
    break;
  }
  console.log('this is still reachable');
}
