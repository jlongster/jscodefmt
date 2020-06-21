function foo(x) { return [x, x > 0, "number " + x]; }

var [n, b, s] = foo(42);
n * s.length;
