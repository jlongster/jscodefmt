var B = require('./B');

class C extends B {
  foo(x:string):void { }
}

let c = new C();
(c.foo: number); // error, number !~> function

module.exports = C;
