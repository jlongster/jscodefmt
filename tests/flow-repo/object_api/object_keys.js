/* @flow */

var sealed = {one: 'one', two: 'two'};
(Object.keys(sealed): Array<'one'|'two'>);
(Object.keys(sealed): void); // error, Array<string>

var unsealed = {};
Object.keys(unsealed).forEach(k => {
  (k : number) // error: string ~> number
});

var dict: { [k: number]: string } = {};
Object.keys(dict).forEach(k => {
  (k : number) // error: string ~> number
});

var any: Object = {};
(Object.keys(any): Array<number>); // error, Array<string>

class Foo {
  prop: string;
  foo() {}
}
// constructor and foo not enumerable
(Object.keys(new Foo()): Array<'error'>); // error: prop ~> error

class Bar extends Foo {
  bar_prop: string;
  bar() {}
}
// only own enumerable props
(Object.keys(new Bar()): Array<'error'>); // error: bar_prop ~> error
