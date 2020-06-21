class C { }
var M = { C: C };

var x:M.C = 0;

type foo = {bar: number};

declare var of_type_foo: foo;
type bar = typeof of_type_foo.bar;

var a: bar = 42;
var b: bar = 'asdf'; // Error: string ~> number
