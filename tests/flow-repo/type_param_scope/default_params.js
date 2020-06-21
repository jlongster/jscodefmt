function f<T>(a:T) {
  function g<U>(b:U, c:T = a) {
    function h(d:U = b) {}
    h(); // ok
    h(b); // ok
    h(c); // err, T ~> U
  }
  g(0); // ok
  g(0,a); // ok
  g(0,0); // error: number ~> T
}
f(0); // ok
