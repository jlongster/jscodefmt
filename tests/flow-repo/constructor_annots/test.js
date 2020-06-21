var Foo = require('./constructors').Foo;
var x: string = new Foo().x; // error, found number instead of string
var y: string = Foo.y; // error, found number instead of string
var z: string = new Foo().m();

var Foo2 = require('./constructors').Foo2;
var x2: string = new Foo2().x; // error, found boolean instead of string
var y2: string = Foo2.y; // error, found boolean instead of string
var z2: string = new Foo2().m();
