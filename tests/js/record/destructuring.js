const { a, b } = #{ a: 1, b: 2 };
assert(a === 1);
assert(b === 2);

const { a, ...rest } = #{ a: 1, b: 2, c: 3 };
assert(a === 1);
assert(typeof rest === "object");
assert(rest.b === 2);
assert(rest.c === 3);
