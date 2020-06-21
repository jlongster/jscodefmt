// @flow

// Sanity checks:
//  - use of bind in a position of a function predicate.
//    (This case should fall through, as method calls
//    are currently not supported.) The original behavior
//    (including `havoc`) should be retained.

class C {
  m() {
    return true;
  }
  a: 1;

  n() {
    if(this.m.bind(this)) {
      this.a;
    }
  }
}

declare var m: Function;
const o = { a: 1 };

if (m.bind(o)) {
  o.a;
}


class D {
  m: Function;

  n() {
    if(this.m({})) { }
  }
}

declare var m: Function;
const x = "";
if (m.bind(this)(x)) { }
