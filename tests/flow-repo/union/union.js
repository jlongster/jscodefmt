function bar(x: Document | string): void { }
bar(0);

class C { }
class D { }
function CD(b) {
  var E = b? C: D;
  var c:C = new E(); // error, since E could be D, and D is not a subtype of C
  function qux(e: E) { } // this annotation is an error: is it C, or is it D?
  function qux2(e: C | D) { } // OK
  qux2(new C);
}

declare class F {
    foo(x: number):void;
    foo(x: string):void;
}
function corge(b) {
    var x = b ? "" : 0;
    new F().foo(x);
}
