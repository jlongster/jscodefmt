/* @flow */

var x : {[key: string]: string} = {};
var y : {[key: string]: number} = x; // 2 errors, number !~> string & vice versa
var z : {[key: number]: string} = x; // 2 errors, string !~> number & vice versa

var a : {[key: string]: ?string} = {};
var b : {[key: string]: string} = a; // 2 errors (null & undefined)
var c : {[key: string]: ?string} = b; // 2 errors, since c['x'] = null updates b

// 2 errors (number !~> string, string !~> number)
function foo0(x: Array<{[key: string]: number}>): Array<{[key: string]: string}> {
  return x;
}

// error, fooBar:string !~> number (x's dictionary)
function foo1(
  x: Array<{[key: string]: number}>
): Array<{[key: string]: number, fooBar: string}> {
  return x;
}

function foo2(
  x: Array<{[key: string]: mixed}>
): Array<{[key: string]: mixed, fooBar: string}> {
  x[0].fooBar = 123; // OK, since number ~> mixed (x elem's dictionary)
  return x; // error: mixed ~> string
}

// OK, since we assume dictionaries have every key
function foo3(x: {[key: string]: number}): {foo: number} {
  return x;
}

// error: foo can't exist in x
function foo4(x: {[key: string]: number}): {[key: string]: number, foo: string} {
  return x;
}

// error, some prop in x could be incompatible (covariance)
function foo5(x: Array<{[key: string]: number}>): Array<{foo: number}> {
  return x;
}

// error, some prop in return could be incompatible
function foo6(x: Array<{foo: number}>): Array<{[key: string]: number}> {
  return x;
}

function foo7(x: {bar: string, [key: string]: number}) {
  (x.bar: string);
}

function foo8(x: {[key: string]: number}) {
  (x.foo: string); // error
  (x.foo: number);
}
