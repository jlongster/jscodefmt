/* @flow */

function Bar(x: number) {
  this.x = x;
}
Bar.prototype.getX = function() { return this.x; }
Bar.prototype.getY = function(): string { return this.y; }

module.exports = Bar;
