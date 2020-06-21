// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

//////////////////////////////
// example with object types
//////////////////////////////

function obj(a: A1 | A2) {
  return a.x;
}

const obj_result = obj({ x: "" }); // currently an error! (expect it to be OK)

// Type definitions used above are defined below, but in an order that
// deliberately makes their full resolution as lazy as possible. The call above
// blocks until A1 is partially resolved. Since the argument partially matches
// A1, that branch is selected. Later, that branch errors, but other branches
// have been lost by then.

type A1 = { x: B1 };
type A2 = { x: B2 };

type B1 = number;
type B2 = string;

(obj_result: B1 | B2);

///////////////////////////////////////
// similar example with function types
///////////////////////////////////////

function fun(a: A3 | A4) {
  return a();
}

const fun_result = fun(() => "");

type A3 = () => B3;
type A4 = () => B4;

type B3 = number;
type B4 = string;

(fun_result: B3 | B4);

/////////////////////////////////////////////
// similar example with class instance types
/////////////////////////////////////////////

function inst(a: A5 | A6) { }

class B5 { }
class B6 { }
inst([new B6]);

type A5 = B5[];
type A6 = B6[];
