// @flow

function foo1(o: { x: number }) {
  if (o.p1) { // OK, this is an idiomatic way of testing property existence
    o.x;
  }
}

function foo2(o: { x: number }) {
  if (o.p2) { // OK
    o.p2.x; // error, since o.p2's type is unknown (e.g., could be `number`)
  }
}

function foo3(o: { x: number }) {
  o.p3.x; // usual error outside conditional
}

function foo4(o: $Exact<{ x: number }>) {
  if (o.p4) { // OK
    o.p4.x; // currently OK, should be unreachable
  } else {
    o.p4.x; // error
  }
}

function foo5() {
  const o = { };
  _foo5();
  if (o.p) { o.p(); }
  function _foo5() {
    o.p = function() { }
  }
}

function foo6(o: mixed) {
  if (o.bar) {} // error, any lookup on mixed is unsafe
}

function foo7(o: mixed) {
  if (typeof o.bar === 'string') {} // error
  if (o && typeof o.bar === 'string') {} // ok
  if (o != null && typeof o.bar === 'string') {} // ok
  if (o !== null && o !== undefined && typeof o.bar === 'string') {} // ok
}

function foo8(o: { p: mixed }) {
  if (o.p && o.p.q) {} // this is ok because o.p is truthy, so o.p.q is safe
  if (o.p && o.p.q && o.p.q.r) {}
}

type Foo9Expected = {
  foo: string,
}

function foo9() {
  const actual = {};
  if (actual.foo === undefined) {
    actual.foo = 'foo';
  }
  (actual: Foo9Expected);
}
