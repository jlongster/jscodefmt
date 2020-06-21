// @flow

class C<X> { }
var cn: C<number> = new C;
cn;

function foo() { return C; }
var D = foo();
var dn: D<number> = new C;
dn;

type E<X> = C<X>;
var en: E<number> = new C;
en;

type F<X> = C<void>;
var fn: F<number> = new C;
fn;

type O<X> = { x: X };
var on: O<number> = { x: 0 };
on;

type Mono = C<void>;
var mn: Mono<number> = new C; // error: application of non-poly type
mn;
