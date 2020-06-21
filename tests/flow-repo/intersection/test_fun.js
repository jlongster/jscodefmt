/**
 * Tests for intersections of function types.
 *
 * Note: Flow abuses intersection types to model
 * function overloading, which precludes using a
 * correct intersection of return types in the result.
 *
 * Here we test the special case where return types
 * are equal. Tests of the overloading behavior can
 * be found in tests/overload
 *
 * Definitions lin lib/lib.js
 *
 * @noflow
 */

// intersection of function types satisfies union of param types

type F = (_: ObjA) => void;
type G = (_: ObjB) => void;
type FG = (_: ObjA | ObjB) => void;

declare var fun1 : F & G;

(fun1 : FG);

var fun2 : FG = fun1;

// simpler variation
declare var f : ((_: number) => void) & ((_: string) => void);
var g: (_: number | string) => void = f;
