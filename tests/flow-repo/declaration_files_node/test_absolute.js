/* @flow */

// This will require ./node_modules/B.js.flow
var B1 = require('B');
(B1.fun(): string); // Error number ~> string

// This will require ./node_modules/B.js.flow
var B2 = require('B.js');
(B2.fun(): string); // Error number ~> string

var C = require('package_with_full_main');
(C.fun(): string); // Error number ~> string

var D = require('package_with_partial_main');
(D.fun(): string); // Error number ~> string

var E = require('package_with_no_package_json');
(E.fun(): string); // Error number ~> string

var F = require('package_with_dir_main');
(F.fun(): string); // Error number ~> string
