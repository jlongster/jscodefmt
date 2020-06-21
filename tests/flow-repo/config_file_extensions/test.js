/*
 * @flow
 */

function foo(x) {
  var a: number = 'asdf';
  return x * 10;
}

// This file should be ignored, so this should not result in an error
foo('Hello, world!');
