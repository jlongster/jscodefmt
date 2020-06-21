// @flow

let tests = [
  // global
  function() {
    (copyProperties()); // error, unknown global
  },

  // annotation
  function(copyProperties: Object$Assign) {
    let result = {};
    result.baz = false;
    (copyProperties(
      result,
      { foo: 'a' },
      { bar: 123 }
    ): { foo: string, bar: number, baz: boolean });
  },

  // module from lib
  function() {
    const copyProperties = require('copyProperties');
    let x = { foo: 'a' };
    let y = { bar: 123 };
    (copyProperties({}, x, y): { foo: string, bar: number });
  },

  // too few args
  function(copyProperties: Object$Assign) {
    copyProperties();
    (copyProperties({ foo: 'a' }): { foo: number }); // err, num !~> string
  },

  // passed as a function
  function(copyProperties: Object$Assign) {
    function x(cb: Function) {}
    x(copyProperties);
  }
];
