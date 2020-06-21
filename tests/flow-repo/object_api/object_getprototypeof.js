// @flow

class Foo {}
class Bar extends Foo {}

let tests = [
  function() {
    const x = new Bar();
    (Object.getPrototypeOf(x): Foo);
  },
];
