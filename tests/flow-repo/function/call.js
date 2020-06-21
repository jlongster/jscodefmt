// @flow

function test(a: string, b: number): number {
  return this.length; // expect []/"" this
}

// args flow correctly into params
test.call("", "", 0);

// wrong this is an error
test.call(0, "", 0); // error: lookup `length` on Number

// not enough arguments is an error
test.call("", ""); // error: void ~> number

// mistyped arguments is an error
test.call("", "", ""); // error: string ~> number (2nd arg)
test.call("", 0, 0); // error: number ~> string (1st arg)

// resolve args array from tvar
function f(args) { test.call("", args[0], args[1]) }
f(["", 0]); // OK
f(["", ""]); // error: string ~> number (2nd arg)
f([0, 0]); // error: number ~> string (1st arg)

// expect 3 errors:
// - lookup length on Number (0 used as `this`)
// - number !~> string (param a)
// - string !~> number (param b)
(test.apply.call(test, 0, [0, 'foo']): number);

// args are optional
function test2(): number { return 0; }
(test2.call(): number);
(test2.call(""): number);

// callable objects
function test3(x: { (a: string, b: string): void }) {
  x.call(x, 'foo', 'bar'); // ok
  x.call(x, 'foo', 123); // error, number !~> string
}
