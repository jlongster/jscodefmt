function foo(x?: number) {}
foo(undefined); // ok

function bar(x = "bar"): string {
  return x;
}
bar(undefined); // ok
