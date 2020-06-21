// @noflow

/**
 * Test that shows how the implementation of union types is broken
 */

//////////////////////////////////////////
// example with generic class inheritance
//////////////////////////////////////////

function inst(a: E<B4>): C<number> | C<string> { return a; }

const mk_C = () => C;
const mk_D = () => D;
const mk_E = () => E;

type B4 = string;

const _D = mk_D();
class E<X> extends _D<X> { }

const _C = mk_C();
class D<X> extends _C<X> { }

class C<X> { }
