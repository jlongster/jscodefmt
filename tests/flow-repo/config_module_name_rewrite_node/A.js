/* @flow */

var m1 = require('./1DoesntExist');
var a_1: number = m1.numVal;
var a_2: string = m1.numVal; // Error: number ~> string
import {numVal} from './1DoesntExist';
var a_3: number = numVal;
var a_4: string = numVal; // Error: number ~> string

// This tests that, for node, the first name mapping that both matches *and*
// results in a valid module filename is picked.
var m2 = require('./2DoesntExist');
var b_1: number = m2.numVal;
var b_2: string = m2.numVal; // Error: number ~> string
import {numVal as numVal2} from './3DoesntExist';
var b_3: number = numVal2;
var b_4: string = numVal2; // Error: number ~> string

// node_modules/Exists/index.js
var m3 = require('4DoesntExist');
var c_1: number = m3.numVal;
var c_2: string = m3.numVal; // Error: number ~> string
import {numVal as numVal3} from '5DoesntExist';
var c_3: number = numVal3;
var c_4: string = numVal3; // Error: number ~> string
