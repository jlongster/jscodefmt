/* @flow */

var docblock = require('qux/docblock');
var min = require('d3/min.js');
var corge = require('qux/corge');
var SomeOtherModule = require('SomeOtherModule');

// make sure we don't pick up non-header @providesModule
// annotations - see node_modules/qux/docblock.js
var unreachable = require('annotation');

(docblock.fun(): string);
(min.fun(): string);
(corge.fun(): string);
(SomeOtherModule.fun(): string);
