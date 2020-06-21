/**
 * like class and function values, any-typed values may be used in
 * type annotations. Here we test propagation of any through the
 * annotation - without it, the body of the if will be unreachable
 */

type AsyncRequest = any;

function foo(o: ?AsyncRequest) {
  if (o) {
    var n: number = o;
  }
}
