// @flow

function* generator(): Iterable<[string, number]> {
  while (true) {
    yield ['foo', 123];
  }
}

let tests = [
  // good constructors
  function() {
    let w = new Map();
    let x = new Map(null);
    let y = new Map([['foo', 123]]);
    let z = new Map(generator());
    let a: Map<string, number> = new Map();
    let b: Map<string, number> = new Map([['foo', 123]]);
    let c: Map<string, number> = new Map(generator());
  },

  // bad constructors
  function() {
    let x = new Map(['foo', 123]); // error
    let y: Map<number, string> = new Map([['foo', 123]]); // error
  },

  // get()
  function(x: Map<string, number>) {
    (x.get('foo'): boolean); // error, string | void
    x.get(123); // error, wrong key type
  },
];
