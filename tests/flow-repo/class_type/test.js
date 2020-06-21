class A { }
function foo(x: Class<A>): A {
  return new x(); // OK
}

class B {
  constructor(_: any) { }
}
function bar(x: Class<B>): B {
  return new x(); // error (too few args)
}
