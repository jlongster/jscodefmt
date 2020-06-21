var Bar = require('./Bar');
var mixin = require('mixin');

class Foo extends mixin(Bar) {
  m() {
    var x: string = this.x;
    this.y = "";
  }
}
