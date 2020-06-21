/**
 * @providesModule ES6_Default_NamedClass1
 * @flow
 */

declare export default class FooImpl { givesANum(): number; };

// Regression test for https://github.com/facebook/flow/issues/511
//
// Default-exported class should also be available in local scope
declare export { FooImpl as Foo }
declare export function getAFoo(): FooImpl;
