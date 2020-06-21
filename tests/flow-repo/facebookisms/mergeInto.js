// @flow

let tests = [
  // global
  function() {
    (mergeInto()); // error, unknown global
  },

  // annotation
  function(mergeInto: $Facebookism$MergeInto) {
    let result = {};
    result.baz = false;
    (mergeInto(result, { foo: 'a' }, { bar: 123 }): void);
    (result: { foo: string, bar: number, baz: boolean });
  },

  // module from lib
  function() {
    const mergeInto = require('mergeInto');
    let result: { foo?: string, bar?: number, baz: boolean } = { baz: false };
    (mergeInto(result, { foo: 'a' }, { bar: 123 }): void);
  },

  // too few args
  function(mergeInto: $Facebookism$MergeInto) {
    mergeInto();
  },

  // passed as a function
  function(mergeInto: $Facebookism$MergeInto) {
    function x(cb: Function) {}
    x(mergeInto);
  }
];
