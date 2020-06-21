// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

////////////////////
// recursive types
////////////////////

function rec(x: F1 | F2) { }
rec({ x: 0 });

type F1 = G1;
type F2 = G2;
type G1 = { x: H1, y?: G1 };
type G2 = { x: H2, y?: G2 };
type H1 = string;
type H2 = number;

///////////////////////////////
// polymorphic recursive types
///////////////////////////////

function polyrec(x: PF<number> | PF<string>) { }
rec({ x: 0 });

type PF<X> = PG<X>;
type PG<X> = { x: X, y?: PG<X> };
