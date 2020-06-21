var APIKeys = require('./enum');
// object that maps "AGE" to "age", "NAME" to "name"

function foo(x: $Keys<typeof APIKeys>) { }
foo("AGE");
foo("LOCATION"); // error

function bar(x: $Keys<{age: number}>) { }
bar(APIKeys.AGE); // not an error: APIKeys.AGE = "age"
bar(APIKeys.NAME); // error: since "NAME" is not in the smaller enum

var object = {};
object[APIKeys.AGE] = 123; // i.e., object.age = 123
object[APIKeys.NAME] = "FOO"; // i.e., object.name = "FOO"

var age:number = object[APIKeys.AGE];
var name:number = object[APIKeys.NAME]; // error: object.name is a string

var indices = { red: 0, green: 1, blue: 2 };
var tuple = [42, "hello", false];
var red:string = tuple[indices.red]; // error: tuple[0] is a number
