var Bar = class Foo {
  static factory(): Foo { // OK: Foo is a type in this scope
    return new Foo()      // OK: Foo is a runtime binding in this scope
  }
};

var bar1: Bar = new Bar() // OK
var bar2: Bar = Bar.factory() // OK

// NB: Don't write expected errors using Foo to avoid error collapse hiding an
// unexpected failure in the above code.

var B = class Baz { }
var b = new Baz(); // error: Baz is not a runtime binding in this scope

var C = class Qux { }
var c: Qux = new C(); // error: Qux is not a type in this scope

// OK: anon classes create no binding, but can be bound manually
var Anon = class { }
var anon: Anon = new Anon();

class Alias { }
var _Alias = class Alias {
  static factory(): Alias {
    return new Alias();
  }
}
var alias1: Alias = new _Alias(); // error: bad pun
var alias2: Alias = _Alias.factory(); // error: bad pun
