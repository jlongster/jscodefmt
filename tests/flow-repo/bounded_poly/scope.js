function foo<X, Y:X>(x:X, y:Y):void { }
foo(0, "");

function bar<X:number, Y:X>(x:X, y:Y): number { return y*0; }
