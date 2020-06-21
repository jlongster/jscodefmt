// Foo is a class-like function
function Foo() {
  this.x = 0; // constructs objects with property x
}
Foo.y = 0; // has static property y
Foo.prototype = { m() { return 0; } };

// exporting Foo directly doesn't work
// Foo's instance and static props are not picked up
exports.Foo = Foo;

// so you want to type Foo, by declaring it as a class
interface IFooPrototype {
  m: () => number;
}
interface IFoo extends IFooPrototype {
  x: boolean; // error, should have declared x: number instead
  static (): void;
  constructor(): void;
}
exports.Foo2 = (Foo: Class<IFoo>);
