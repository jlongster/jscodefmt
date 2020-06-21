// @noflow

// polymorphic recursive types

type F<X> = { f: F<X>, x: X }
type G = { x: number }
type H = { x: string }

function rec(x: F<string>): G | H { return x; }
