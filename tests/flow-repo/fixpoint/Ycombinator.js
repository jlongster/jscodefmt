
/* @providesModule Ycombinator */

function Y(f) {
  function g(x) { return f(x(x)); }
  g(g);
}

function func1(f) {
  function fix_f(x:number):number { return f(x); }
  return fix_f;
}
function func2(f) {
  function fix_f(x:string):string { return f(x); }
  return fix_f;
}

Y(func1);
Y(func2);

module.exports = Y;
