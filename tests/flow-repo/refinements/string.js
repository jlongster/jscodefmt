// @flow

type Mode = "a" | "b" | "c";

let tests = [
  function(x: string) {
    if (x === 'foo') {
      (x: void); // error
    }
    (x: 'foo'); // error
  },

  function(x: string) {
    if (x !== 'foo') {
      (x: 'foo'); // error
    }
    (x: void); // error
  },

  function(x: 'bar'): 'foo' {
    if (x === 'foo') {
      return x; // unreachable, no error
    }
    return 'foo';
  },

  function(x: 'foo'): string {
    if (x === 'bar') {
      return x;
    }
    return x;
  },

  function(x: 'foo') {
    if (x !== 'bar') {
      (x: 'foo');
    }
    (x: 'foo');
  },

  function(x: 'foo'): string {
    if (x === 'foo') {
      return x;
    }
    return x;
  },

  function(x: 'foo' | 'bar') {
    if (x === 'foo') {
      (x: 'foo');
      (x: void); // error
    }
    if (x === 'bar') {
      (x: 'bar');
      (x: void); // error
    }
  },

  function(x: { foo: string }): 'foo' {
    if (x.foo === 'foo') {
      return x.foo;
    }
    return x.foo; // error
  },

  function(
    x: { kind: 'foo', foo: string } | { kind: 'bar', bar: string }
  ): string {
    if (x.kind === 'foo') {
      return x.foo;
    } else {
      return x.bar;
    }
  },

  function(str: string, obj: { foo: string }) {
    if (str === obj.bar) { // ok, typos allowed in conditionals
    }
  },

  function(str: string, obj: {[key: string]: string}) {
    if (str === obj.bar) { // ok
    }
  },

  function(str: string): Mode {
    var ch = str[0];
    if (ch !== "a" && ch !== "b" && ch !== "c") {
      throw new Error("Wrong string passed");
    }
    return ch;
  },

  function(s: string): ?Mode {
    if (s === "a") {
      return s;
    } else if (s === "d") {
      return s; // error
    }
  },

  function(mode: Mode) {
    switch (mode) {
      case "a":
        (mode: "a");
        break;

      case "b":
      case "c":
        (mode: "b" | "c");
        break;
    }
  },

  function(x: string): "" {
    if (x) {
      return x; // error
    } else {
      return x; // no error, inferred to be ""
    }
  },

  // Simple template literals are ok
  function(x: string): 'foo' {
    if (x === `foo`) {
      return x;
    }
    if (`foo` === x) {
      return x;
    }
    return 'foo';
  },
];
