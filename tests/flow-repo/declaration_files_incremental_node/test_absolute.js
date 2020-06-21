/* @flow */

// This will require ./node_modules/B.js.flow
var B1 = require('B');
(B1.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

// This will require ./node_modules/B.js.flow
var B2 = require('B.js');
(B2.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var C = require('package_with_full_main');
(C.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var D = require('package_with_partial_main');
(D.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var E = require('package_with_no_package_json');
(E.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var F = require('package_with_dir_main');
(F.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

// This will require ./node_modules/B.js.flow
var B1 = require('B');
(B1.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

// This will require ./node_modules/B.js.flow
var B2 = require('B.js');
(B2.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var C = require('package_with_full_main');
(C.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var D = require('package_with_partial_main');
(D.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var E = require('package_with_no_package_json');
(E.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean

var F = require('package_with_dir_main');
(F.fun(): boolean); // Error either Implementation ~> boolean or Declaration ~> boolean
