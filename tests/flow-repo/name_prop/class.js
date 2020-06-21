class A {}

var test1 = A.bar; // Error bar doesn't exist
var test2: string = A.name;
var test3: number = A.name; // Error string ~> number

var a = new A();
var test4 = a.constructor.bar; // Error bar doesn't exist
var test5: string = a.constructor.name;
var test6: number = a.constructor.name; // Error string ~> number
