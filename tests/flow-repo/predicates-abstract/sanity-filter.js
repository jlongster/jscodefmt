// @flow

declare function my_filter<T, P: $Pred<1>>(v: Array<T>, cb: P): Array<$Refine<T,P,1>>;

// Sanity check A: filtering the wrong type
declare var a: Array<mixed>;
const b = my_filter(a, is_string);
(b: Array<number>);


// Sanity check B: Passing non-predicate function to filter
declare var c: Array<mixed>;
const d = my_filter(c, is_string_regular);
(d: Array<string>);

function is_string(x): boolean %checks {
  return typeof x === "string";
}

function is_string_regular(x): boolean {
  return typeof x === "string";
}
