// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

///////////////////////////////
// example with function types
///////////////////////////////

function fun(a: ((x: number) => number) | ((x: string) => string)) { }

function a1(x) { return x; }
fun(a1);

function fun_call(x: string): string { return a1(x); }

/////////////////////////////
// example with array types
/////////////////////////////

function arr(a: number[] | string[]) { }

var a2 = [];
arr(a2);

function arr_set(x: string, i: number) { a2[i] = x; }
