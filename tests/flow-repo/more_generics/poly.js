var foo1 = function<T>(x:T):T { return x; }

function foo2<T,S>(x:T):S { return x; }

var foo3 = function <T>(x:T):T { return foo3(x); }

function foo4<T,S>(x:T):S { return foo4(x); }

var x = [];
function foo5<T>():Array<T> { return x; }
/*
 var a = foo5();
 a[0] = 0;
 var b = foo5();
 var y: string = b[0];
*/

var foo6 = function<R>(x:R):R { return foo1(x); }

function foo7<R>(x:R):R { return foo5(); }

function foo8<U>(x:U,y):U {
  var z = foo8(x,x);
  y();
  return x;
}
/*
 foo8(0,void 0);
*/
