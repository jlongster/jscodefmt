// @flow
var str = require('./import');
function foo() { }
foo();
str

type Point = [number, string];
const x:Point = [1, "foo"];
type MyStr = "cool";
const y:MyStr = "cool";
type MyBool = true;
const z:MyBool = true;
type MyNum = 42;
const w:MyNum = 42;
