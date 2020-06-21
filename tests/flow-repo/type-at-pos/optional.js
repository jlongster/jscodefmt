// @flow

function foo(x?: string) {
  return x;
}

foo();

function bar(obj: { x?: string }) {
  return obj.x;
}

function qux(x?) {
  return x;
}
