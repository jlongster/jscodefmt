function Foo() { }
var o = new Foo();
var x:number = o.x;

Foo.prototype.m = function() { return this.x; }

var y:number = o.m();
o.x = "...";

Foo.prototype = { m: function() { return false; } }

var export_o: { x:any; } = o; // awkward type cast

module.exports = export_o;
