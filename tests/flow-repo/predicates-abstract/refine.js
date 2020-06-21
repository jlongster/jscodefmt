// @flow

/*
  $Pred<N> is an "abstract predicate type", i.e. denotes a (function) type that
  refines N variables. So if `cb` is a function, then it should be refining
  exactly N argument. It is abstract in that we do not need to specify:
  (a) which variables are going to be refined (just the number), or (b) what
  exactly the refinement (predicate) is going to be.

  $Refine<T,P,k> is a refinement type, that refines type T with the k-th
  argument that gets refined by an abstract preficate type P.
*/
declare function refine<T, P: $Pred<1>>(v: T, cb: P): $Refine<T,P,1>;
// function refine(v, cb)
// { if (cb(v)) { return v; } else { throw new Error(); } }

/*
  Use case
*/
declare var a: mixed;
var b = refine(a, is_string);
(b: string);

declare function refine_fst<T, P: $Pred<2>>(v: T, w: T, cb: P): $Refine<T,P,1>;
// function refine_fst(v, w, cb)
// { if (cb(v, w)) { return v; } else { throw new Error(); } }

declare var c: mixed;
declare var d: mixed;

var e = refine2(c, d, is_string_and_number);
(e: string);


declare function refine2<T, P: $Pred<2>>(v: T, w: T, cb: P): $Refine<T,P,1>;

// function refine_fst(v, w, cb)
// { if (cb(v, w)) { return w; } else { throw new Error(); } }

function is_string(x): boolean %checks {
  return typeof x === "string";
}

function is_string_and_number(x, y): %checks {
  return typeof x === "string" && typeof y === "number";
}
