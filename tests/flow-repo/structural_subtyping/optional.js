/* @flow */

interface HasOptional {
  a: string,
  b?: number,
};

var test1: HasOptional = { a: "hello" }

var test2: HasOptional = {}; // Error: missing property a

var test3: HasOptional = { a: "hello", b: true }; // Error: boolean ~> number
