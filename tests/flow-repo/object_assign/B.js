/**
 * @flow
 */

var A = require('./A.js');

var good: number = A.Good.foo();

var f = A.Bad.foo; // Property access is fine
var bad_: number = f(); // Calling the function is fine

var bad: number = A.Bad.foo(); // Method call is not fine
/*
B.js|12 col 1 error|  call of method foo
|| Property not found in
A.js|8 col 23 error|  object literal
*/
