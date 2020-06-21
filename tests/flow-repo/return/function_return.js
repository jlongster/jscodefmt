class C {
    foo() { }
    bar() { return; }
    fn(x:number) { return x; }
}

function f(x): number {
  if (x > 1) {
    return 42;
  }
}

function g(x): ?number {
  if (x > 1) {
    return 42;
  }
}

function h(x): number {
  if (x > 1) {
    return 42;
  }
  return;
}

function i(x): ?number {
  if (x > 1) {
    return 42;
  }
  return;
}

module.exports = C;

//function fn(x:number) { return x; }
//module.exports = fn;
