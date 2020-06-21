/* @flow */

type Foo = {
  a: string;    // exists in TestClass
  b: string;    // doesn't exist
  c?: ?string;  // exists in TestClass, optional
  d?: number;   // doesn't exist
}

class TestClass {
  a: string;
  c: ?string;
}

var x = new TestClass();

x.a; // ok
x.b; // error, TestClass has no b
x.c; // ok
x.d; // error, TestClass has no d

var y : Foo = x;
y.b; // error, doesn't exist in TestClass
y.d; // ok, it's optional

class Test2Superclass {
  a: number;  // conflicts with cast to Foo
  c: ?number; // conflicts with cast to Foo
}
class Test2Class extends Test2Superclass {
  b: number;  // conflicts with cast to Foo
}

var z = new Test2Class();
var w : Foo = z;
