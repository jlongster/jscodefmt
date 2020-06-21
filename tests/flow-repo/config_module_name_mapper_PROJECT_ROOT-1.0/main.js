// @flow

import {test} from 'testmodule';

var a: number = test;
var b: string = test; // Error: number ~> string
