function Foo() { return {}; }
var foo: number = new Foo(); // error (returns object literal above)

function Bar() { return 0; }
var bar: number = new Bar(); // error (returns new object)

function Qux() { }
var qux: number = new Qux(); // error (returns new object)

class A { }
function B() { return new A(); }
var a: A = new B(); // OK (returns new A)

// type applications should be applied before deciding if object-like
type C<T> = { x: T };
function makeC<T>(x: T): C<T> { return {x}; }
(new makeC('x'): C<string>); // normally you wouldn't use `new`, but you can

// unions should be split before deciding if object-like
function makeUnion(): number | {x: string} {
  return {x: 'x'};
}
(new makeUnion(): {x: string}); // error: `number` returns {}, missing prop x
