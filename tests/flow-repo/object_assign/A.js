/**
 * @flow
 */

var EventEmitter = require('events').EventEmitter;

// This pattern seems to cause the trouble.
var Bad = Object.assign({}, EventEmitter.prototype, {
  foo: function(): string { return 'hi'; }
});

// Calling Bad.foo() in the same file doesn't error
var bad: number = Bad.foo();

// Doesn't repro if I extend the class myself
class MyEventEmitter extends events$EventEmitter {}
var Good = Object.assign({}, MyEventEmitter.prototype, {
  foo: function(): string { return 'hi'; }
});
// Calling Good.foo() in the same file doesn't error
var good: number = Good.foo();

module.exports = {
  Bad: Bad,
  Good: Good,
};
