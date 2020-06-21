/* @providesModule Demo */

class A {
  x: number; // instance field declaration
  constructor(x) { this.x = x; }

  getX() { return this.x; }

  onLoad(callback) {
    return callback(this.getX());
  }
}

function callback(x: string) { return x.length; }

var a = new A(42);
a.onLoad(callback);

module.exports = A;
