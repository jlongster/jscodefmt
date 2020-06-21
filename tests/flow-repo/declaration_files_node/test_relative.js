/* @flow */

// This will require ./A.js.flow
var A1 = require('./A');
(A1.fun(): string); // Error number ~> string

// This will require ./A.js.flow
var A2 = require('./A.js');
(A2.fun(): string); // Error number ~> string

var CJS = require('./CJS.js');
(CJS: string);
(CJS: number); // Error: string ~> number
