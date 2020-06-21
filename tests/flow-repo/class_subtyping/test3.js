class A<X, Y, Z> {}
class B extends A<string, number, bool> {}
class C<X, Y, Z> extends B {}

var c: C<number, string, Array<bool>> = new C; // none of the type args matter
var a: A<string, number, Array<bool>> = c; // the third type arg is incorrect
