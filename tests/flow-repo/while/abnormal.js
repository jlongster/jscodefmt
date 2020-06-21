/* @flow */

function foo(x: boolean) {
  var ii = 10;
  while (ii-- >= 0) {
    if (x) {
      continue;
    }
    return;
  }
  //console.log('this is still reachable');
}

function bar(x: boolean) {
  var ii = 0;
  while (ii > 0) {
    return;
  }
  //console.log('this is still reachable');
}
