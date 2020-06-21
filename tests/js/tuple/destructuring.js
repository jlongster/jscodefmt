const [a, b] = #[1, 2];
assert(a === 1);
assert(b === 2);

const [a, ...rest] = #[1, 2, 3];
assert(a === 1);
assert(Array.isArray(rest));
assert(rest[0] === 2);
assert(rest[1] === 3);
