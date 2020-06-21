/* @flow */

var lib = require('./library');

function add(a: number, b: number): number {
  return a + b;
}

var re = /^keynote (talk){2} (lightning){3,5} (talk){2} closing partytime!!!/

// t123456
add(lib.iTakeAString(42), 7);

// D123456
lib.bar();
