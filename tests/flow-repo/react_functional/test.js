import React from "react";

function F(props: { foo: string }) {}
<F />; // error: missing `foo`
<F foo={0} />; // error: number ~> string
<F foo="" />; // ok

// props subtyping is property-wise covariant
function G(props: { foo: string|numner }) {}
<G foo="" />; // ok

var Z = 0;
<Z />; // error, expected React component
