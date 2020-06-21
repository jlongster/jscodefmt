/* @flow */

function a(): number {
  var x: ?string = null;
  return x ? 1 : 0;
}

function b(): number {
    var x: ?number = null;
    return x != null ? x : 0;
}

function c(): number {
  // equivalent to `return (x && 1) || 0`
  var x = false;
  var temp = (x ? 1 : x);
  return temp ? temp : 0;
}

function d(): string { // expected `: number | boolean`
  // equivalent to `return x != null && x`
  var x: ?number = null;
  return (x != null) ? x : (x != null);
}
