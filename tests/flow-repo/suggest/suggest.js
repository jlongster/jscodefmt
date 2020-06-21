/* @flow */

var bar = require('./lib');

function foo(z: number) { return bar(z); }

var array = ["foo", "bar"];
array;

module.exports = {foo:foo};
