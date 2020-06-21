// @flow

class X {
  #foo: number
  constructor() {
    (this?.#foo: empty);
  }
};

class Y {
  #bar: X
  #baz: ?X
  constructor() {
    (this?.#bar: empty);
    (this?.#baz: empty);
  }
};
