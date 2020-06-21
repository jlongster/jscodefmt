// @flow

type Mode = 0 | 1 | 2;

let tests = [
  function(x: number) {
    if (x === 0) {
      (x: void); // error
    }
    (x: 0); // error
  },

  function(x: number) {
    if (x !== 0) {
      (x: 0); // error
    }
    (x: void); // error
  },

  function(x: 1): 0 {
    if (x === 0) {
      return x; // unreachable, no error
    }
    return 0;
  },

  function(x: 0): number {
    if (x === 1) {
      return x;
    }
    return x;
  },

  function(x: 0) {
    if (x !== 1) {
      (x: 0);
    }
    (x: 0);
  },

  function(x: 0): number {
    if (x === 0) {
      return x;
    }
    return x;
  },

  function(x: 0 | 1) {
    if (x === 0) {
      (x: 0);
      (x: void); // error
    }
    if (x === 1) {
      (x: 1);
      (x: void); // error
    }
  },

  function(x: { foo: number }): 0 {
    if (x.foo === 0) {
      return x.foo;
    }
    return x.foo; // error
  },

  function(
    x: { kind: 0, foo: number } | { kind: 1, bar: number }
  ): number {
    if (x.kind === 0) {
      return x.foo;
    } else {
      return x.bar;
    }
  },

  function(num: number, obj: { foo: number }) {
    if (num === obj.bar) { // ok, typos allowed in conditionals
    }
  },

  function(num: number, obj: {[key: string]: number}) {
    if (num === obj.bar) { // ok
    }
  },

  function(n: number): Mode {
    if (n !== 0 && n !== 1 && n !== 2) {
      throw new Error("Wrong number passed");
    }
    return n;
  },

  function(s: number): ?Mode {
    if (s === 0) {
      return s;
    } else if (s === 3) {
      return s; // error
    }
  },

  function(mode: Mode) {
    switch (mode) {
      case 0:
        (mode: 0);
        break;

      case 1:
      case 2:
        (mode: 1 | 2);
        break;
    }
  },

  function(x: number): 0 {
    if (x) {
      return x; // error
    } else {
      return x; // no error, inferred to be 0
    }
  },
];
