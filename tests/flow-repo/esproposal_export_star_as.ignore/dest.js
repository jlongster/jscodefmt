// @flow

import {source} from "./test";

var a: number = source.num;
var b: string = source.num; // Error: num ~> string

var c: string = source.str;
var d: number = source.str; // Ignored error: num ~> string
