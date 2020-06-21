/* @flow */

var m1 = require('1DoesntExist');
import {numVal as numVal1} from '1DoesntExist';
var a_1: number = m1.numVal;
var a_2: number = numVal1;

// Error: 'Exists2' is not a valid module name
//
// This tests that, for haste, the first name_mapper regexp that happens to
// match the given module name string is picked.
var m2 = require('2DoesntExist'); // Error
import {numVal as numVal2} from '3DoesntExist'; // Error
