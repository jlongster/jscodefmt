/* The logic that allows ({}: {p?:T}), described in test3.js, should _not_ also
   fire for exact annotations. */

const a: {| a: number |} = { a: 1 };
const b: { a: number, b?: number } = a; // error: property `b` not found
b.b = 0; // because subsequent writes would widen the exact object
(a.b: number); // error: property `b` not found
