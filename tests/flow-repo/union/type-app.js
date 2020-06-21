/**
 * @flow
 */

class LocalClass<T> {}

var a: LocalClass<number> | number = 123;

// Iterator is defined in a lib file, so the speculative algorithm for the
// union type would incorrectly succeed for Iterator<number>. Only later during
// the merge would we fine the error, but it would be too late. The diff that
// introduces this test fixes this such that the speculative algorithm is
// correctly delayed upon encountering a non-concrete TypeAppT
var b: Iterator<number> | number = 123;
