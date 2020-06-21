/**
 * Tests for intersections of object types
 *
 * @noflow
 */

// TODO we should give explicit errors for incompatibilities
// which make an intersection uninhabitable:
// - shared mutable properties with different types
// - different dictionary types
//
// Currently we give no such errors. Instead, we rely on
// the impossibility of providing a value for such a type
// to produce errors on value inflows. This is clearly
// suboptimal, since eg declared vars require no explicit
// provision of values. This leaves the impossible types
// free to flow downstream and satisfy impossible constraints.

// intersection of object types satisfies union of properties
declare var a: A;
var b: B = a;

// intersection of dictionary types:
declare var c: C;
var d: D = c; // ok

// dict type mismatch
type E = { [key: string]: string };
var e: E = c; // error
