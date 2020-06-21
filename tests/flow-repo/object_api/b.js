/* @flow */

var a = require('./a');
var b = Object.assign({ bar() {}, ...{} }, a);
b.a(); // works here
module.exports = b;
