declare class Foo {
  foo: string;
}

function foo0(x: ?string): string {
  return x && x || "";
}

function foo1(x: ?Foo): string {
  return x && x.foo || "";
}

function foo2(x: ?Class<Foo>): string {
  return x && new x().foo || "";
}
