/***
 * nested unions
 * @flow
 */

// inline
var nested1: ('foo' | 'bar') | 'baz' = 'baz';

// through tvars
type FooBar = 'foo' | 'bar';
type Baz = 'baz';
type FooBarBaz = FooBar | Baz;

var nested2: FooBarBaz = 'baz';
