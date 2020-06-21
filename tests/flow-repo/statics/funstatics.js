function C() { }
C.prototype.f = function() { return C.g(0); }
C.g = function(x) { return x; };

var x:string = new C().f();
