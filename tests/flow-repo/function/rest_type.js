/* regression tests */

type rest_array = <T>(...xs: Array<T>) => T; // Ok, arrays can be rest params

type rest_tuple = <T>(...xs: [T]) => T; // Ok, tuples can be rest params

type rest_ro_array = <T>(...xs: $ReadOnlyArray<T>) => T;  // Ok

type rest_any = (...xs: any) => any; // Ok, any can be a rest param

type rest_t = <U, T: Array<U>>(...xs: T) => U; // Ok, bounded targ can be rest

type unbound_rest_t = <T>(...xs: T) => void; // Should be error but no way to check yet :(
function test_unbound_rest(f: <T>(x: T, ...xs: T) => void) {
  f(123); // Error - number ~> array - luckily this errors
}

type string_rest_t = (...xs: string) => void; // Should be error but no way to check yet :(
function test_string_rest(f: string_rest_t) {
  f('hello'); // Error - string ~> array - luckily this errors
}

type Rest = Array<string>;
type rest_alias = (...xs: Rest) => void; // Ok

type rest_union = (...xs: [1,2] | Array<number>) => number; // OK

type rest_intersection = (...xs: { x: number } & [1,2]) => number; // OK

type empty_rest = <T:Array<mixed>>(...xs: T) => T; // OK
((f: empty_rest) => (f(): empty)); // Error Array ~> empty
