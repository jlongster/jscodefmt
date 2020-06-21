// @flow

type T = { x: number };
type S = { x: string };

declare var a: T;
declare var b: S;
declare var c: T;

module.exports = { a, b, c: a };
