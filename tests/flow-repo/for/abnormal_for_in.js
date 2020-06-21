function foo(x: boolean) {
  var obj = { a: 1, b: 2};
  for (var prop in obj) {
    if (x) {
      continue;
    }
    return;
  }
  console.log('this is still reachable');
}

function bar(x: boolean) {
  for (var prop in {}) {
    return;
  }
  console.log('this is still reachable');
}

function baz(x: boolean) {
  for (var prop in {}) {
    continue;
  }
  console.log('this is still reachable');
}

function bliffl(x: boolean) {
  var obj = { a: 1, b: 2};
  loop1: for (var prop1 in obj) {
    loop2: for (var prop2 in obj) {
      break loop1;
    }
    console.log('this is still reachable');
  }
  console.log('this is still reachable');
}

function corge(x: boolean) {
  for (var prop in {}) {
    break;
  }
  console.log('this is still reachable');
}
