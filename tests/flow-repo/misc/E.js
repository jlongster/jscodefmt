
/* @providesModule E */

function h(x:number) { }
var proto = { fn: h }

var o = Object.create(proto);
o.fn(false);

module.exports = {obj: o};
