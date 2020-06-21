// @flow

// Cannot declare predicate with a function body is present.

function f5(x: mixed): %checks (x !== null) { return x !== null }

var a2 = (x: mixed): %checks (x !== null) => x !== null;
