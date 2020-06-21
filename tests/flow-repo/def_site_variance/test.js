class Variance<+Out,-In> {
  foo(x: Out): Out { return x; }
  bar(y: In): In { return y; }
}

class A { }
class B extends A { }

function subtyping(
  v1: Variance<A,B>,
  v2: Variance<B,A>
) {
  (v1: Variance<B,A>); // error on both targs (A ~/~> B)
  (v2: Variance<A,B>); // OK for both targs (B ~> A)
}

class PropVariance<+Out,-In> {
  inv1: Out; // error
  inv2: In; // error
  -co1: Out; // error
  -co2: In; // ok
  +con1: Out; // ok
  +con2: In; // error

  inv_dict1: {[k:string]: Out}; // error
  inv_dict2: {[k:string]: In}; // error
  co_dict1: {+[k:string]: Out}; // ok
  co_dict2: {+[k:string]: In}; // error
  con_dict1: {-[k:string]: Out}; // error
  con_dict2: {-[k:string]: In}; // ok
}
