/**
 * @flow
 */

type Foo = number;

// You can't use it as an identifier
var x = Foo;

// But using it in a type should still work
var a: Foo = 123;
var b: Array<Foo> = [123];
type c = Foo;
