/* regression tests */

function rest_array<T>(...xs: Array<T>): T { // Ok, arrays can be rest params
  return xs[0];
}

function rest_tuple<T>(...xs: [T]): T { // Ok, tuples can be rest params
  return xs[0];
}

function rest_ro_array<T>(...xs: $ReadOnlyArray<T>): T { // Ok
  return xs[0];
}

function rest_any(...xs: any): any { // Ok, any can be a rest param
  return xs[0];
}

function rest_t<U, T: Array<U>>(...xs: T): U { // Ok, bounded targ can be rest
  return xs[0];
}

// These are ok bounds for the rest param
function unbound_rest_t<T>(...xs: T): void {}
function mixed_rest_t<T: mixed>(...xs: T): void {}
function array_rest_t<T: Array<mixed>>(...xs: T): void {}
function roarray_rest_t<T: $ReadOnlyArray<mixed>>(...xs: T): void {}
function iterable_rest_t<T: Iterable<mixed>>(...xs: T): void {}
function empty_rest_t<T: empty>(...xs: T): void {}
function bounds_on_bounds<T>() {
  return function<U: T>(...xs: T): void {}
}

// These are bad bounds for the rest param
function bad_unbound_rest_t<T>(...xs: T): T {
  return xs.pop(); // Error - no bound on T
}
function string_rest_t<T: string>(...xs: T): void {} // Error - rest param can't be a string
function empty_rest_t<T: empty>(...xs: T): void {} // Error - rest param can't be empty

type Rest = Array<string>;
function rest_alias(...xs: Rest): void {} // Ok

function rest_union(...xs: [1,2] | Array<number>): number { // OK
  return xs[0];
}

function rest_intersection(...xs: { x: number } & [1,2]): number { // OK
  return xs[0] + xs.x;
}

function empty_rest<T:Array<mixed>>(...xs: T): T { return xs; }
(empty_rest(): empty); // Error Array ~> empty

function return_rest_param<Args:Array<mixed>>(
  f: (...args: Args) => void,
): (...args: Args) => number {
  return function(...args) {
    return args; // Error: Array ~> number
  }
}

function requires_first_param(x: number, ...rest: Array<number>): void {}
requires_first_param(); // Error: missing first arg
