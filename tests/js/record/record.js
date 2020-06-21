const record1 = #{
    a: 1,
    b: 2,
    c: 3,
};

const record2 = #{...record1, b: 5};

assert(record1.a === 1);
assert(record1["a"] === 1);
assert(record1 !== record2);
assert(record2 === #{ a: 1, c: 3, b: 5 });
assert(record1?.a === 1);
assert(record1?.d === undefined);
assert(record1?.d ?? 5 === 5);
assert(record1.d?.a === undefined);
