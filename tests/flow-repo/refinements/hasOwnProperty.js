/* @flow */

function foo(x:{y?:() => void}) {
  x.y(); // error: could be undefined
  if (x.hasOwnProperty('y')) {
    x.y(); // error: still could be undefined
  }
  if (x.hasOwnProperty('z')) {
    x.z(); // error: unreachable, but we don't help you here
  }
}

function bar(x:Object) {
  x.y(); // treated as `any`, so allowed
  if (x.hasOwnProperty('y')) {
    x.y(); // still treated as `any`, so allowed
  }
  if (x.hasOwnProperty('z')) {
    x.z(); // also treated as `any`, so allowed
  }
}
