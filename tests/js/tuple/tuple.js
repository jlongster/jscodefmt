const tuple1 = #[1, 2, 3];

assert(tuple1[0] === 1);

const tuple2 = tuple1.with(0, 2);
assert(tuple1 !== tuple2);
assert(tuple2 === #[2, 2, 3]);

const tuple3 = #[1, ...tuple2];
assert(tuple3 === #[1, 2, 2, 3]);

const tuple4 = tuple3.pushed(4);
assert(tuple4 === #[1, 2, 2, 3, 4]);

assert(tuple4.first() === 1);
const tuple5 = tuple4.popped();
assert(tuple5 === #[2, 2, 3, 4]);
