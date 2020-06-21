/* Dictionary types are object types that include an indexer, which specifies a
 * key type and a value type. The presence of an indexer makes the object type
 * unsealed, but all added properties must be consistent with the indexer
 * signature.
 *
 * Dictionaries can be used to represent the common idiom of objects used as
 * maps. They can also be used to represent array-like objects, e.g., NodeList
 * from the DOM API.
 *
 * A dictionary is assumed to have every property described by it's key type.
 * This behavior is similar to the behavior of arrays, which are assumed to have
 * a value at every index.
 *
 * @flow
 */

// Some logic is variance-sensitive.
class A {}
class B extends A {}
class C extends B {}

// Just a couple of short type names. Compare to string/number.
class X {}
class Y {}

// Any property can be set on a dict with string keys.
function set_prop_to_string_key(
  o: {[k:string]:any},
) {
  o.prop = "ok";
}

// **UNSOUND**
// This is allowed by design. We don't track get/set and we don't wrap the
// return type in a maybe.
function unsound_dict_has_every_key(
  o: {[k:string]:X},
) {
  (o.p: X); // ok
  (o["p"]: X); // ok
}

// As with any object type, we can assign subtypes to properties.
function set_prop_covariant(
  o: {[k:string]:B},
) {
  o.p = new A; // error, A ~> B
  o.p = new B; // ok
  o.p = new C; // ok
}

// This isn't specific behavior to dictionaries, but for completeness...
function get_prop_contravariant(
  o: {[k:string]:B},
) {
  (o.p: A); // ok
  (o.p: B); // ok
  (o.p: C); // error, C ~> B
}

// Dot-notation can not be used to add properties to dictionaries with
// non-string keys, because keys are strings.
function add_prop_to_nonstring_key_dot(
  o: {[k:number]:any},
) {
  o.prop = "err"; // error: string ~> number
}

// Bracket notation can be used to add properties to dictionaries with
// non-string keys, even though all keys are strings. This is a convenient
// affordance.
function add_prop_to_nonstring_key_bracket(
  o: {[k:number]:any},
) {
  o[0] = "ok";
}

// Objects can be part dict, part not by mixing an indexer with declared props.
function mix_with_declared_props(
  o: {[k:number]:X,p:Y},
  x: X,
  y: Y,
) {
  (o[0]: X); // ok
  (o.p: Y); // ok
  o[0] = x; // ok
  o.p = y; // ok
}

// Indeed, dict types are still Objects and have Object.prototype stuff
function object_prototype(
  o: {[k:string]:number},
): {[k:string]:number, +toString: () => string} {
  (o.toString(): boolean); // error: string ~> boolean
  return o; // ok
}

// **UNSOUND**
// Because we support non-string props w/ bracket notation, it's possible to
// write into a declared prop unsoundly.
function unsound_string_conversion_alias_declared_prop(
  o: {[k:number]:any, "0":X},
) {
  o[0] = "not-x"; // a["0"] no longer X
}

function unification_dict_values_invariant(
  x: Array<{[k:string]:B}>,
) {
  let a: Array<{[k:string]:A}> = x; // error
  a[0].p = new A; // in[0].p no longer B

  let b: Array<{[k:string]:B}> = x; // ok

  let c: Array<{[k:string]:C}> = x; // error
  (x[0].p: C); // not true
}

function subtype_dict_values_invariant(
  x: {[k:string]:B},
) {
  let a: {[k:string]:A} = x; // error
  a.p = new A; // x[0].p no longer B

  let b: {[k:string]:B} = x; // ok

  let c: {[k:string]:C} = x; // error
  (x.p: C); // not true
}

function subtype_dict_values_fresh_exception() {
  let a: {[k:string]:A} = {
    a: new A, // ok, A == A
    b: new B, // ok, B <: A
    c: new C, // ok, C <: A
  };

  let b: {[k:string]:B} = {
    a: new A, // error, A not <: B
    b: new B, // ok, B == B
    c: new C, // ok, C <: A
  };

  let c: {[k:string]:C} = {
    a: new A, // error, A not <: C
    b: new B, // error, A not <: C
    c: new C, // ok, C == C
  };
}

// Actually, unsound_string_conversion_alias_declared_prop behavior makes an
// argument that we shouldn't really care about this, since we ignore the fact
// that coercing values to string keys can cause unintended aliasing in general.
// Barring some compelling use case for that in this context, though, we choose
// to be strict.
function unification_dict_keys_invariant(
  x: Array<{[k:B]:any}>,
) {
  let a: Array<{[k:A]:any}> = x; // error
  let b: Array<{[k:B]:any}> = x; // ok
  let c: Array<{[k:C]:any}> = x; // error
}

function subtype_dict_keys_invariant(
  x: {[k:B]:any},
) {
  let a: {[k:A]:any} = x; // error
  let b: {[k:B]:any} = x; // ok
  let c: {[k:C]:any} = x; // error
}

function unification_mix_with_declared_props_invariant_l(
  x: Array<{[k:string]:B}>,
) {
  let a: Array<{[k:string]:B, p:A}> = x; // error: A ~> B
  a[0].p = new A; // x[0].p no longer B

  let b: Array<{[k:string]:B, p:B}> = x; // ok

  let c: Array<{[k:string]:B, p:C}> = x; // error
  (x[0].p: C); // not true
}

function unification_mix_with_declared_props_invariant_r(
  xa: Array<{[k:string]:A, p:B}>,
  xb: Array<{[k:string]:B, p:B}>,
  xc: Array<{[k:string]:C, p:B}>,
) {
  let a: Array<{[k:string]:A}> = xa; // error
  a[0].p = new A; // xa[0].p no longer B

  let b: Array<{[k:string]:B}> = xb; // ok

  let c: Array<{[k:string]:C}> = xc; // error
  (xc[0].p: C); // not true
}

function subtype_mix_with_declared_props_invariant_l(
  x: {[k:string]:B},
) {
  let a: {[k:string]:B, p:A} = x; // error: A ~> B
  a.p = new A; // x.p no longer B

  let b: {[k:string]:B, p:B} = x; // ok

  let c: {[k:string]:B, p:C} = x; // error
  (x.p: C); // not true
}

function subtype_mix_with_declared_props_invariant_r(
  xa: {[k:string]:A, p:B},
  xb: {[k:string]:B, p:B},
  xc: {[k:string]:C, p:B},
) {
  let a: {[k:string]:A} = xa; // error
  a.p = new A; // xa.p no longer B

  let b: {[k:string]:B} = xb; // ok

  let c: {[k:string]:C} = xc; // error
  (xc.p: C); // not true
}

function unification_dict_to_obj(
  x: Array<{[k:string]:X}>,
): Array<{p:X}> {
  return x; // error: if allowed, could write {p:X,q:Y} into `x`
}

function unification_obj_to_dict(
  x: Array<{p:X}>,
): Array<{[k:string]:X}> {
  return x; // error: if allowed, could write {p:X,q:Y} into returned array
}

function subtype_dict_to_obj(
  x: {[k:string]:B},
) {
  let a: {p:A} = x; // error
  a.p = new A; // x.p no longer B

  let b: {p:B} = x; // ok

  let c: {p:C} = x; // error
  (x.p: C); // not true
}

function subtype_obj_to_dict(
  x: {p:B},
) {
  let a: {[k:string]:A} = x; // error
  a.p = new A; // x.p no longer B

  let b: {[k:string]:B} = x;

  let c: {[k:string]:C} = x; // error
  (x.p: C); // not true
}

// Only props in l which are not in u must match indexer, but must do so
// exactly.
function subtype_obj_to_mixed(
  x: {p:B, x:X},
) {
  let a: {[k:string]:A,x:X} = x; // error (as above), but exclusive of x
  let b: {[k:string]:B,x:X} = x; // ok,
  let c: {[k:string]:C,x:X} = x; // error (as above), but exclusive of x
}

function unification_dict_to_mixed(
  x: Array<{[k:string]:B}>,
) {
  let a: Array<{[k:string]:B, p:A}> = x; // error
  let b: Array<{[k:string]:B, p:B}> = x; // ok
  let c: Array<{[k:string]:B, p:C}> = x; // error
}

function subtype_dict_to_mixed(
  x: {[k:string]:B},
) {
  let a: {[k:string]:B, p:A} = x; // error
  let b: {[k:string]:B, p:B} = x; // ok
  let c: {[k:string]:B, p:C} = x; // error
}

function subtype_dict_to_optional_a(
  x: {[k:string]:B},
) {
  let a: {p?:A} = x; // error
}

function subtype_dict_to_optional_b(
  x: {[k:string]:B},
) {
  let b: {p?:B} = x; // ok
}

function subtype_dict_to_optional_c(
  x: {[k:string]:B},
) {
  let c: {p?:C} = x; // error
}

function subtype_optional_a_to_dict(
  x: {p?:A},
): {[k:string]:B} { // error: A ~> B
  return x;
}

function subtype_optional_b_to_dict(
  x: {p?:B},
): {[k:string]:B} { // ok
  return x;
}

function subtype_optional_c_to_dict(
  x: {p?:C},
): {[k:string]:B} { // error: C ~> B
  return x;
}
