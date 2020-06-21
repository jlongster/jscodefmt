function foo(x: boolean) {
  var arr = [1, 2, 3];
  for (var elem of arr) {
    if (x) {
      continue;
    }
    return;
  }
  console.log('this is still reachable');
}

function bar(x: boolean) {
  for (var elem of []) {
    return;
  }
  console.log('this is still reachable');
}

function baz(x: boolean) {
  for (var elem of []) {
    continue;
  }
  console.log('this is still reachable');
}

function bliffl(x: boolean) {
  var arr = [1, 2, 3];
  loop1: for (var elem of arr) {
    loop2: for (var elem of arr) {
      break loop1;
    }
    console.log('this is still reachable');
  }
  console.log('this is still reachable');
}

function corge(x: boolean) {
  for (var elem of []) {
    break;
  }
  console.log('this is still reachable');
}
