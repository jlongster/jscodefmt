// @flow

let tests = [
  // constructor
  function() {
    new RegExp('foo');
    new RegExp(/foo/);
    new RegExp('foo', 'i');
    new RegExp('foo', 'ig');
    new RegExp(/foo/, 'i'); // invalid in ES5, valid in ES6
    new RegExp(/foo/g, 'i'); // invalid in ES5, valid in ES6
  },

  // called as a function (equivalent to the constructor per ES6 21.2.3)
  function() {
    RegExp('foo');
    RegExp(/foo/);
    RegExp('foo', 'i');
    RegExp('foo', 'ig');
    RegExp(/foo/, 'i'); // invalid in ES5, valid in ES6
    RegExp(/foo/g, 'i'); // invalid in ES5, valid in ES6
  },

  // invalid flags
  function() {
    RegExp('foo', 'z'); // error
    new RegExp('foo', 'z'); // error
  }
];
