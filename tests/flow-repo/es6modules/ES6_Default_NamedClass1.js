/**
 * @providesModule ES6_Default_NamedClass1
 * @flow
 */

export default class Foo { givesANum(): number { return 42; }};

// Regression test for https://github.com/facebook/flow/issues/511
//
// Default-exported class should also be available in local scope
new Foo();
