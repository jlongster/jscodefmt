/* @providesModule Condition */

function f(x:number) { }
function g() { return (42 || "hello"); }

var x = g();
if (typeof x === "string") {
  x = 0;
}
f(x);

class A {}
function h() { return (42 || new A()); }

var y = h();
if (y instanceof A) {
  y = 0;
}
//f(y);

function bar() { return true; }

class C { qux() { } }

function foo() {

  var c = "...";
  c = new C();
  if (bar()) {
    c.qux();
  }

}

function goofy() {
  var x = g();
  if (typeof x == 'function') {
    x();
  } else { // if (typeof x == 'number') {
    //f(x);
  }
}

function goofy2() {
  var o = {x : 0}
  if (typeof o.x == 'function') {
    o.x();
  }
  var y = o.x;
  if (typeof y == 'function') {
    y();
  } else {
    //f(y);
  }
}

module.exports = true;
