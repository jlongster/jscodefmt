/* @flow */

let tests = [
  function() {
    let x = {};
    Object.defineProperty(x, 'foo', { value: '' });
  },
];
