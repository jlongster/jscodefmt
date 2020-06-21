function bar(x?,y?) { x * 0; }
bar(0);

var foo:(x?:number)=>void = bar;
foo();

function qux(x="hello",...y):string { foo(x); return y[0]; }

qux(0,0); // Error, number ~> string
qux(0,...[42, ""]); // Error, number ~> string
qux(0,...["",42]); // No error

module.exports = qux;
