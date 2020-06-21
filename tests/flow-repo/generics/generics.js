class C<X> {
  x:X;
  constructor(x:X) { this.x = x; }
  get():X { return this.x; }
}

class D<T> {
  x:T;
  m<S>(z:S,u:T,v):S {
    this.x = u;
    v.u = u;
    return z;
  }
}

var d = new D();
var o = {};
var b = d.m(true,0,o);
var s:string = d.x;
var n:number = o.u;

class E<X> extends C<X> {
    //x:X;
    set(x:X):X { /*return x;*/ this.x = x; return /*this.x; */this.get(); }
}

var e = new E(); // error: too few arguments to inherited constructor
var x:string = e.set(0);

class F<X> { }
class G<Y> extends F<Array<Y>> {}
class H<Z> extends G<Array<Z>> {
    x:Z;
    foo(x:Z) { this.x = x; }
}

var h1 = new H();
h1.foo(["..."]);
var h2:F<Array<Array<Array<number>>>> = h1;

var obj : Object<string, string> = {} // error, arity 0
var fn : Function<string> = function() { return 'foo'; } // error, arity 0
var fn : function<string> = function() { return 'foo'; } // error, arity 0
