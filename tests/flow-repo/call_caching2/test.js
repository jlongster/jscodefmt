// @flow

function Foo(items: ?Iterable<number>) {
  Iterable(items || []).size;
}
