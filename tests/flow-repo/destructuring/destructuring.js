declare var a:string;
declare var b:string;
declare var c:string;
[{a1:a, b},c] = [{a1:0, b:1},2];

var {m} = {m:0};
({m} = {m:m});

var obj;
({n: obj.x} = {n:3});
[obj.x] = ['foo'];

function foo({p, z:[r]}) {
    a = p;
    b = z;
    c = r;
}
foo({p:0, z:[1,2]});

[a,,b,...c] = [0,1,true,3];

function bar({x, ...z}) {
    var o:{x: string; y: number;} = z;
}
bar({x:"",y:0});

var spread = {y:""};
var extend: {x:number; y:string; z: boolean} = {x:0, ...spread};

function qux(_: {a:number}) { }
qux({a:""});
function corge({b}: {b:string}) { }
corge({b:0});

var {n}:{n: number} = {n: ""}

function test() {
  var {foo} = {bar: 123}; // error on foo
  var {bar, baz} = {bar: 123} // error on baz
}

function test() {
  var x = {foo: 'abc', bar: 123};
  var {foo, ...rest} = x;
  (x.baz: string); // error, baz doesn't exist
  (rest.baz: string); // no error, rest is unsealed
}

module.exports = corge;

class Base {
  baseprop1: number;
  baseprop2: number;
}

class Child extends Base {
  childprop1: number;
  childprop2: number;
}

var {baseprop1, childprop1, ...others} = new Child();

var bp1: number = baseprop1;
var bp1_err: string = baseprop1; // Error: number ~> string
var bp2: number = others.baseprop2;
var bp2_err: string = others.baseprop2; // Error: number ~> string

var cp1: number = childprop1;
var cp1_err: string = childprop1; // Error: number ~> string
var cp2: number = others.childprop1;
var cp2_err: string = others.childprop2; // Error: number ~> string
