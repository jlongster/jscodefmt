// @flow

var someVar = 42;

class Foo {
  outer = someVar;
  selfTyped: Foo;
  selfTypedInit = new Foo();

  static outer = someVar;
  static selfTyped: Foo;
  static selfTypedInit = new Foo();

  constructor() {
    var someVar = 'asdf';
  }
}

/**
 * Field initializers execute in a scope immediately under the scope outside the
 * class definition.
 */
(new Foo().outer: number);
(new Foo().outer: string); // Error: number ~> string
(Foo.outer: number);
(Foo.outer: string); // Error: number ~> string

/**
 * Field initializers should be able to refer to the class type in their type
 * annotations.
 */
(new Foo().selfTyped: Foo);
(new Foo().selfTyped: number); // Error: Foo ~> number
(Foo.selfTyped: Foo);
(Foo.selfTyped: number); // Error: Foo ~> number

(new Foo().selfTypedInit: Foo);
(new Foo().selfTypedInit: number); // Error: Foo ~> number
(Foo.selfTypedInit: Foo);
(Foo.selfTypedInit: number); // Error: Foo ~> number
