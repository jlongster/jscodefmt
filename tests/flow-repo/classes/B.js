var A = require('./A');

class B extends A { }

let b = new B();
(b.foo: number); // error, number !~> function

module.exports = B;
