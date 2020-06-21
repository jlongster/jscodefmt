/** @flow */

/* This test documents an example we ran into of a type annotation leaking.
 *
 * When foo() calls bar(), we should make sure the type of x matches the type
 * annotation for y and stop. We should type the body of bar() with the type
 * annotation of y.
 *
 * However, the leaky type annotation meant that we were flowing x's type to y
 * and type checking the body of bar() using the stricter dictionary type,
 * leading to an error.
 */

type MyObj = Object;

function foo(x: {[key: string]: mixed}) {
  bar(x);
}

function bar(y: MyObj): string {
  return y.foo;
}
