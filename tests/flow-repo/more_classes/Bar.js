
/* @providesModule Bar */

var Qux = require('Qux');

class Bar {
  y:number;
  self:Bar;
  constructor(y:number) {
    this.y = y;
    this.self = this;
  }

  bar(z:string,u:string):string {
    new Qux().w = "?";
    return z;
  }
}

module.exports = Bar;
