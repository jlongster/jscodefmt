// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

//////////////////////////////
// example with object types
//////////////////////////////

function obj(a: { x: number } | { x: string }) { }

obj(({ x: "" }: A1));

type A1 = { x: B1 };

type B1 = string;

///////////////////////////////////////
// similar example with function types
///////////////////////////////////////

function fun(a: (() => number) | (() => string)) { }

fun(((() => ""): A2));

type A2 = () => B2;

type B2 = string;

/////////////////////////////////////////////////////
// similar example with generic class instance types
/////////////////////////////////////////////////////

class C<X> { }

function inst(a: C<number> | C<string>) { }

inst((new C: A3));

type A3 = C<B3>;

type B3 = string;

/////////////////////////////////////////////
// similar example with generic type aliases
/////////////////////////////////////////////

function alias(a: T<number> | T<string>) { }
alias({ x: (x: V<B4>) => { } });

type T<X> = { x: U<X> }
type U<X> = (x: V<X>) => void;
type V<X> = X;

type B4 = string;

// class statics

function stat(a: { x: number } | { x: string }) { }

class D {
  static x: B5;
}

stat(D);

type B5 = string;

// tuples

function tup(a: [number,boolean] | [string,boolean]) { }

tup((["",false]: A6));

type A6 = [B6,boolean];
type B6 = string;
