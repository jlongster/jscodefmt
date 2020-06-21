class C {
  static f(x:number) { }
  static x:string;
}

C.g = function(x:string) { C.f(x); };
C.g(0);

var x:number = C.x;
C.x = 0;