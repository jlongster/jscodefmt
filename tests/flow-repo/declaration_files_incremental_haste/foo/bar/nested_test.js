/* @flow */

var docblock = require('qux/docblock');
var min = require('d3/min.js');
var corge = require('qux/corge');

(docblock.fun(): boolean); // Error: Either Implementation ~> boolean or Declaration ~> boolean
(min.fun(): boolean); // Error: Either Implementation ~> boolean or Declaration ~> boolean
(corge.fun(): boolean); // Error: Either Implementation ~> boolean or Declaration ~> boolean
