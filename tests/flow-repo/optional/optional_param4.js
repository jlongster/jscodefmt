/* @flow */

function foo(x?: number, ...y: Array<string>): [?number, Array<string>] {
  return [x, y];
}

foo(); // OK
foo(123), // OK
foo(123, 'hello'); // OK


foo(true); // ERROR boolean ~> number
foo(123, true); // ERROR boolean ~> string
