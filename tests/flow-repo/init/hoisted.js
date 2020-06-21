/**
 * test initialization tracking in the presence of hoisting
 * @flow
 */

function _if(b: () => boolean) {
  if (b()) {
    var f = function () {};
  }
  f(); // error, possibly undefined
}

function _while(b: () => boolean) {
  while (b()) {
    var f = function () {};
  }
  f(); // error, possibly undefined
}

function _do_while(b: () => boolean) {
  do {
    var f = function () {};
  } while (b());
  f(); // ok
}

function _for(n: number) {
  for (var i = 0; i < n; i++) {
    var f = function () {};
  }
  f(); // error, possibly undefined
}

function _for_in(obj: Object) {
  for (var p in obj) {
    var f = function () {};
  }
  f(); // error, possibly undefined
}

function _for_of(arr: Array<number>) {
  for (var x of arr) {
    var f = function () {};
  }
  f(); // error, possibly undefined
}
