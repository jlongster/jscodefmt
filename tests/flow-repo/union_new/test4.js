// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

///////////////////////////////
// example with function types
///////////////////////////////

function fun(a: ((x: number) => void) | ((x: string) => void)) { }

const a1 = ((x) => {}: A1);
fun(a1);

function fun_call(x: string) { a1(x); }

type A1 = (x: B1) => void;

type B1 = string;

////////////////////////////
// example with array types
////////////////////////////

function arr(a: number[] | string[]) { }

const a2 = ([]: A2);
arr(a2);

function arr_set(x: string, i: number) { a2[i] = x; }
function arr_get(i: number): string { return a2[i]; }

type A2 = B2[];

type B2 = string;
