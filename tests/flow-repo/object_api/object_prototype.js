/* @flow */

function takesABool(x: boolean) {}
function takesAString(x: string) {}
function takesANumber(x: number) {}
function takesAnObject(x: Object) {}

class Foo {}

var a = { foo: 'bar' };
var b = { foo: 'bar', ...{}};
var c = { foo: 'bar', toString: function(): number { return 123; }};
var d : { [key: string]: string } = { foo: 'bar' };
var x = new Date();
var y = new Foo();

//
// toString
//

// call
takesAString(a.toString());
d.toString(); // ok, even though dict specifies strings, this is a function

// get
var aToString : () => string = a.toString;
var aToString2 = a.toString;
takesAString(aToString2());

// set
b.toString = function(): string { return 'foo'; };
c.toString = function(): number { return 123; };

// override
var cToString : () => number = c.toString;

// ... on a built-in instance
var xToString : number = x.toString; // error
var xToString2 : () => number = x.toString; // error
takesAString(x.toString());

// ... on an instance
var yToString : number = y.toString; // error
takesAString(y.toString());

// ... on a primitive
(123).toString();
(123).toString;
(123).toString = function() {}; // error
(123).toString(2);
(123).toString('foo'); // error
(123).toString(null); // error


//
// hasOwnProperty
//

// call
takesABool(a.hasOwnProperty('foo'));

// get
var aHasOwnProperty : (prop: string) => boolean = a.hasOwnProperty;
var aHasOwnProperty2 = a.hasOwnProperty;
takesABool(aHasOwnProperty2('bar'));

// set
b.hasOwnProperty = function() { return false; };

// ... on a built-in instance
var xHasOwnProperty : number = x.hasOwnProperty; // error
var xHasOwnProperty2 : (prop: string) => number = x.hasOwnProperty; // error
takesABool(x.hasOwnProperty('foo'));

// ... on an instance
var yHasOwnProperty : number = y.hasOwnProperty; // error
takesABool(y.hasOwnProperty('foo'));


//
// propertyIsEnumerable
//

// call
takesABool(a.propertyIsEnumerable('foo'));

// get
var aPropertyIsEnumerable : (prop: string) => boolean = a.propertyIsEnumerable;
var aPropertyIsEnumerable2 = a.propertyIsEnumerable;
takesABool(aPropertyIsEnumerable2('bar'));

// set
b.propertyIsEnumerable = function() { return false; };

// ... on a built-in instance
var xPropertyIsEnumerable : number = x.propertyIsEnumerable; // error
var xPropertyIsEnumerable2 : (prop: string) => number =
  x.propertyIsEnumerable; // error
takesABool(x.propertyIsEnumerable('foo'));

// ... on an instance
var yPropertyIsEnumerable : number = y.propertyIsEnumerable; // error
takesABool(y.propertyIsEnumerable('foo'));


//
// valueOf
//

// call
takesAnObject(a.valueOf());

// get
var aValueOf : () => Object = a.valueOf;
var aValueOf2 = a.valueOf;
takesAnObject(aValueOf2());

// set
b.valueOf = function() { return {}; };

// ... on a built-in instance
var xValueOf : number = x.valueOf; // error
takesANumber(x.valueOf());

// ... on an instance
var yValueOf : number = y.valueOf; // error
takesAnObject(y.valueOf());

// ... on a literal
var strValueOf : string = ("foo").valueOf();
var numValueOf : number = (123).valueOf();
var boolValueOf : boolean = (true).valueOf();

//
// toLocaleString
//

// call
takesAString(a.toLocaleString());

// get
var aToLocaleString : () => string = a.toLocaleString;
var aToLocaleString2 = a.toLocaleString;
takesAString(aToLocaleString2());

// set
b.toLocaleString = function() { return 'derp'; };

// ... on a built-in instance
var xToLocaleString : number = x.toLocaleString; // error
var xToLocaleString2 : () => number = x.toLocaleString; // error
takesAString(x.toLocaleString());

// ... on an instance
var yToLocaleString : number = y.toLocaleString; // error
takesAString(y.toLocaleString());


//
// constructor
//

var k : Object = a.constructor;
(123).constructor;
