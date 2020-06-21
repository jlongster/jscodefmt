// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

///////////////////////////////
// example with function types
///////////////////////////////

function fun(a: ((x: number) => void) | ((x: string) => void)) { }

fun((((x) => {}): A1));

type A1 = (x: B1) => void;

type B1 = string;

////////////////////////////
// example with array types
////////////////////////////

function arr(a: number[] | string[]) { }

arr(([]: A2));

type A2 = B2[];

type B2 = string;
