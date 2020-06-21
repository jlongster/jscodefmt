/* @flow */

var A = require('A');
(A.foo(): boolean); // Error: Either AImplementation ~> boolean or ADefinition ~> boolean

var test = require('test');
(test.foo(): boolean); // Error: Either TestImplementation ~> boolean or TestDefinition ~> boolean
