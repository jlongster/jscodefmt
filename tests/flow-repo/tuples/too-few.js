/* @flow */

function foo(a: [Object, Object]) {}

foo([ {} ]); // error, too few elements in array passed to a tuple
