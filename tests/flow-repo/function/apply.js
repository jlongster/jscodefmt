function test(a: string, b: number): number {
  return this.length; // expect []/"" this
}

// tuples flow correctly into params
test.apply("", ["", 0]);

// wrong this is an error
test.apply(0, ["", 0]); // error: lookup `length` on Number

// not enough arguments is an error
test.apply("", [""]); // error: void ~> number

// mistyped arguments is an error
test.apply("", ["", ""]); // error: string ~> number (2nd arg)
test.apply("", [0, 0]); // error: number ~> string (1st arg)

// resolve args array from tvar
function f(args) { test.apply("", args) }
f(["", 0]); // OK
f(["", ""]); // error: string ~> number (2nd arg)
f([0, 0]); // error: number ~> string (1st arg)

// expect array
test.apply("", "not array"); // error: expect array of args

// expect 4 errors:
// - lookup length on Number (because 0 is used as `this`)
// - 123 is not a string
// - 'foo' is not a number
// - return type (number) is not void
(test.call.apply(test, [0, 123, 'foo']): void);

// expect 2 errors:
// - lookup length on number (0 is used as `this`)
// - 123 is not a string
(test.bind.apply(test, [0, 123]): (b: number) => number);

// args are optional
function test2(): number { return 0; }
(test2.apply(): number);
(test2.apply(""): number);

// callable objects
function test3(x: { (a: string, b: string): void }) {
  x.apply(x, ['foo', 'bar']); // ok
  x.apply(x, ['foo', 123]); // error, number !~> string
}
