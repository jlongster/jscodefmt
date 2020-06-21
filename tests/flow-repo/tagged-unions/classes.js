// @flow

class Foo {
  type: 'foo';
  foo: string;
}

class Bar {
  type: 'bar';
  bar: string;
}

type Foobar = Foo | Bar;

function foobar(x: Foobar): string {
  if (x.type === 'foo') {
    return foo(x);
  } else if (x.type === 'bar') {
    return bar(x);
  } else {
    return 'unknown';
  }
}

function foo(x: Foo): string {
  return x.foo;
}

function bar(x: Bar): string {
  return x.bar;
}
