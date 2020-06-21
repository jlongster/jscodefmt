/* @flow */

function foo() {
  this.m();
}

function bar(f: () => void) {
  f(); // passing global object as `this`
  ({ f }).f(); // passing container object as `this`
}

bar(foo); // error, since `this` is used non-trivially in `foo`

function qux(o: { f: () => void }) {
  o.f(); // passing o as `this`
}

qux({ f: foo });  // error, since `this` is used non-trivially in `foo`
