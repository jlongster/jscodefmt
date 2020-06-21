// @flow

// Filter the contents of an array

declare function my_filter<T, P: $Pred<1>>(v: Array<T>, cb: P): Array<$Refine<T,P,1>>;

declare var arr: Array<mixed>;
const barr = my_filter(arr, is_string);
(barr: Array<string>);

function is_string(x): %checks {
  return typeof x === "string";
}
