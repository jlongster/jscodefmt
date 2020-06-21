// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

//////////////////////
// nested union types
//////////////////////

function rec(x: F1 | F2) { }
rec({ x: 0 });

type F1 = G1 | G1_;
type F2 = G2 | G2_;
type G1 = { x: H1 };
type G1_ = { x: H1_ };
type G2 = { x: H2 };
type G2_ = { x: H2_ };
type H1 = boolean;
type H1_ = string;
type H2 = boolean;
type H2_ = number;
