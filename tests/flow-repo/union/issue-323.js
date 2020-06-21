var Foo = require("./issue-323-lib");
var foo = new Foo();
var foostr: Foo | string = foo;
