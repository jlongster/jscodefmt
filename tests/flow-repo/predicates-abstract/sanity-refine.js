// @flow

// Sanity check A: the refinment position index is outside of the allowed range
declare function refine<T, P: $Pred<1>>(v: T, cb: P): $Refine<T,P,2>;

declare var a: mixed;
var b = refine(a, is_string);   // ERROR: index out of bounds
(b: string);


// Sanity check B: refine2 expects a function that accepts 3 arguments but
// it is called with a function that takes 2
declare var c: mixed;
declare var d: mixed;
declare var e: mixed;

declare function refine3<T, P: $Pred<3>>(u: T, v: T, w: T, cb: P): $Refine<T,P,1>;

var e = refine3(c, d, e, is_string_and_number);
(e: string);

function is_string_and_number(x, y): %checks {
  return typeof x === "string" && typeof y === "number";
}


// Sanity check C: expecting a predicate function but passed a non-predicate one
var e = refine(a, is_string_regular);   // ERROR: is_string_regular is not a
                                        // predicate function
(e: number);

////////////////////////////////////////////////////////////////////////////////

function is_string(x): %checks {
  return typeof x === "string";
}

function is_string_regular(x)  {
  return typeof x === "string";
}

function is_string_and_number(x, y): %checks {
  return typeof x === "string" && typeof y === "number";
}
