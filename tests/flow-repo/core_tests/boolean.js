// @flow

// Boolean (the class) tests. booleans (the literals) are not part of core.js

let tests = [
  // constructor
  function() {
    new Boolean();
    new Boolean(0);
    new Boolean(-0);
    new Boolean(null);
    new Boolean(false);
    new Boolean(NaN);
    new Boolean(undefined);
    new Boolean("");
  },

  // toString
  function() {
    (true).toString();
    let x: boolean = false;
    x.toString();
    (new Boolean(true)).toString();
  },

  // valueOf
  function() {
    ((new Boolean(0)).valueOf(): boolean);
  },

  // casting
  function() {
    Boolean();
    Boolean(0);
    Boolean(-0);
    Boolean(null);
    Boolean(false);
    Boolean(NaN);
    Boolean(undefined);
    Boolean("");
  },
];
