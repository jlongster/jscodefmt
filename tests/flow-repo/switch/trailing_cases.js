/**
 * trailing cases are allowed - spot checks that we handle them as usual
 * @flow
 */
function f1(i) {
  var x;

  switch (i) {
  case 0:
    x = 0;
    break;
  case 1:
    x = 1;
    break;
  default:
    x = -1;
    break;
  case 2:
    x = "2";
    break;
  }

  var y:number = x; // error, number | string ~/> number
}

function f2(i) {
  var x;

  switch (i) {
  case 0:
  case 1:
  default:
    x = 1;
    break;
  case 2:
    // does not fall through default
  }

  var y:number = x; // error, number | uninitialized ~/> number
}

function f3(i) {
  var x;

  switch (i) {
  case 0:
  case 1:
  default:
    // falls through to subsequent cases
  case 2:
    x = 1;
  }

  var y:number = x; // no error
}

function foo(x): number {
    switch (x) {
      case 0:
      default: throw new Error('hi');
      case 1: return 1;
    }
}

function bar(x) {
    switch (x) {
      default: return;
      case 0: break;
    }
    1;
}

function baz(x): number {
  switch (x) {
    case 0: break;
    default: throw new Error('hi');
    case 1: return 1;
  }
  return 2;
}
