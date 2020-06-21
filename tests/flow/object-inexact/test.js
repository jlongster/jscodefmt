//@flow
type T = {
  a: number,
  ...,
}

type I = {
  [string]: number,
  ...,
}

type U = { a: number, b: number, c: number, d: number, e: number, f: number, g: number, ...};

type V = {x: {...}, y: {x: {...}, a: number, b: number, c: number, d: number, e: number, f: number, ...}, z: {...}, foo: number, bar: {foo: number, ...}, ...};

function test(x: {foo: number, bar: number, baz: number, qux: nunber, a: number, b: number, c: {a: number, ...}, ...}) { return x; }
function test(x: {foo: number, bar: number, baz: number, qux: nunber, a: number, b: number, c: {a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, ...}, ...}) { return x; }

type W = {...};
type X = {
  ...,
};
